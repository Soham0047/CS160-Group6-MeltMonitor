// Local CSV/GeoJSON loader for MeltMonitor Map (no external APIs).
// - countries.geojson   : polygons (must have ISO_A3 / ADMIN)
// - owid-co2-data.csv   : OWID long CSV (iso_code, year, co2, co2_per_capita)
// - API_EN.GHG.CO2.PC...: World Bank wide CSV (per-capita only); we’ll parse & index by ISO3 + year
//
// Result shape for the map: { years: number[], byIso: Map<ISO3, { [year]: { co2, co2_per_capita } }> }

import Papa from "papaparse";

const COUNTRIES_GEOJSON_URL = "/data/countries.geojson";
const OWID_CSV_URL = "/data/owid-co2-data.csv"; // optional but preferred
const WB_PER_CAPITA_URL =
  "/data/API_EN.GHG.CO2.PC.CE.AR5_DS2_en_csv_v2_6122.csv"; // your local WB CSV (rename as advised)

let _countriesCache = null;
let _indexCache = null;

// ---------- Polygons ----------
export async function fetchCountriesGeoJSON() {
  if (_countriesCache) return _countriesCache;
  const res = await fetch(COUNTRIES_GEOJSON_URL);
  if (!res.ok) throw new Error("Failed to load local countries.geojson");
  const json = await res.json();
  for (const f of json.features) {
    const p = f.properties || {};
    f.properties = p;
    p.ISO3 = String(p.ISO_A3 || p.ISO_A3_EH || "")
      .trim()
      .toUpperCase();
    p.COUNTRY = String(p.ADMIN || p.NAME || "").trim();
  }
  _countriesCache = json;
  return _countriesCache;
}

// ---------- Master index (merge OWID + WB per-capita) ----------
export async function fetchLocalIndex() {
  if (_indexCache) return _indexCache;

  console.log("Loading local index...");

  // Try OWID first (has co2 + co2_per_capita in long format)
  const { years: owidYears, byIso: owidByIso } = await tryLoadOWID();

  // Then overlay/augment with World Bank per-capita (wide format) if present
  const { years: wbYears, byIso: wbByIso } = await tryLoadWBPerCapita();

  // Merge
  const byIso = owidByIso ?? new Map();
  const yearSet = new Set(owidYears ?? []);

  if (wbByIso) {
    console.log("Merging WB data with OWID data...");
    for (const [iso, yearly] of wbByIso.entries()) {
      const base = byIso.get(iso) || {};
      for (const y of Object.keys(yearly)) {
        yearSet.add(Number(y));
        const rec = base[y] || {};
        // Only fill per-capita if missing on OWID
        if (rec.co2_per_capita == null && yearly[y]?.co2_per_capita != null) {
          rec.co2_per_capita = yearly[y].co2_per_capita;
        }
        base[y] = rec;
      }
      byIso.set(iso, base);
    }
  }

  const years = [...yearSet].sort((a, b) => a - b);
  console.log(
    "Final index: countries =",
    byIso.size,
    "years =",
    years.length,
    "range =",
    years[0],
    "-",
    years[years.length - 1]
  );
  _indexCache = { years, byIso };
  return _indexCache;
}

// ---------- Helpers: OWID (long) ----------
async function tryLoadOWID() {
  try {
    console.log("Attempting to load OWID data from:", OWID_CSV_URL);
    const res = await fetch(OWID_CSV_URL);
    if (!res.ok) throw new Error("no owid csv");
    const text = await res.text();
    console.log("OWID CSV loaded, text length:", text.length);
    const { data } = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    console.log("OWID CSV parsed, rows:", data.length);

    const byIso = new Map();
    const years = new Set();

    for (const row of data) {
      const iso = (row.iso_code ?? "").toString().trim().toUpperCase();
      const year = Number(row.year);
      if (!iso || iso.length !== 3 || !Number.isFinite(year)) continue;

      const rec = byIso.get(iso) || {};
      rec[year] = {
        co2: toNum(row.co2), // Mt
        co2_per_capita: toNum(row.co2_per_capita), // t/person
      };
      byIso.set(iso, rec);
      years.add(year);
    }

    console.log("OWID processed countries:", byIso.size, "years:", years.size);
    return { years: [...years].sort((a, b) => a - b), byIso };
  } catch (err) {
    console.error("OWID loading failed:", err);
    return { years: [], byIso: null };
  }
}

// ---------- Helpers: World Bank per-capita (wide) ----------
async function tryLoadWBPerCapita() {
  try {
    console.log("Attempting to load World Bank data from:", WB_PER_CAPITA_URL);
    const res = await fetch(WB_PER_CAPITA_URL);
    if (!res.ok) throw new Error("no wb csv");
    const text = await res.text();
    console.log("WB CSV loaded, text length:", text.length);

    // WB CSVs have metadata lines before the real header.
    // Find the header line that starts with "Country Name,Country Code,Indicator Name,Indicator Code,"
    const lines = text.split(/\r?\n/);
    const headerIdx = lines.findIndex((l) =>
      /^"?(Country Name)"?,\s*"?Country Code"?/i.test(l)
    );
    if (headerIdx === -1) throw new Error("wb header not found");
    console.log("WB header found at line:", headerIdx);

    const sliced = lines.slice(headerIdx).join("\n");
    const { data } = Papa.parse(sliced, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    console.log("WB CSV parsed, rows:", data.length);

    const byIso = new Map();
    const years = new Set();

    // Wide -> index
    for (const row of data) {
      const iso = String(row["Country Code"] || "")
        .trim()
        .toUpperCase();
      if (!iso || iso.length !== 3) continue;
      for (const [key, val] of Object.entries(row)) {
        // Year columns are 4-digit numbers like "1960","1961",...
        if (/^\d{4}$/.test(key)) {
          const y = Number(key);
          const v = toNum(val);
          if (!Number.isFinite(y)) continue;
          years.add(y);
          const entry = byIso.get(iso) || {};
          const rec = entry[y] || {};
          if (v != null) rec.co2_per_capita = v; // t/person
          entry[y] = rec;
          byIso.set(iso, entry);
        }
      }
    }

    console.log("WB processed countries:", byIso.size, "years:", years.size);
    return { years: [...years].sort((a, b) => a - b), byIso };
  } catch (err) {
    console.error("WB loading failed:", err);
    return { years: [], byIso: null };
  }
}

function toNum(v) {
  if (v === null || v === undefined || v === "" || Number.isNaN(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------- Utilities used by the map ----------
export function filterYearsByCoverage(
  { years, byIso },
  metricKey,
  minCountries = 60
) {
  const counts = new Map();
  for (const [, yearly] of byIso.entries()) {
    for (const y of years) {
      const v = yearly?.[y]?.[metricKey];
      if (Number.isFinite(v)) counts.set(y, (counts.get(y) ?? 0) + 1);
    }
  }
  const covered = years.filter((y) => (counts.get(y) ?? 0) >= minCountries);
  const latest = covered.length
    ? covered[covered.length - 1]
    : years[years.length - 1];
  return [covered, latest];
}

export function getMetricValue(byIso, iso3, year, metricKey) {
  const v = byIso?.get(iso3)?.[year]?.[metricKey];
  return Number.isFinite(v) ? v : null;
}
