// Local data loader for the Map (countries + OWID CO2) with robust parsing.
// Serves from Vite public/: /data/countries.geojson and /data/owid-co2-data.csv
import Papa from "papaparse";

const COUNTRIES_GEOJSON_URL = "/data/countries.geojson";
const OWID_CO2_CSV_URL = "/data/owid-co2-data.csv";

let _countriesCache = null;
let _co2IndexCache = null;
let _yearsCache = null;

export async function fetchCountriesGeoJSON() {
  if (_countriesCache) return _countriesCache;
  const res = await fetch(COUNTRIES_GEOJSON_URL);
  if (!res.ok) throw new Error("Failed to load local countries.geojson");
  const json = await res.json();

  // Normalize a few known quirks
  for (const f of json.features) {
    if (!f.properties) f.properties = {};
    // Prefer ISO_A3 if present; some datasets also ship ISO_A3_EH
    f.properties.ISO3 = (f.properties.ISO_A3 || f.properties.ISO_A3_EH || "")
      .toString()
      .trim()
      .toUpperCase();
    f.properties.COUNTRY = (f.properties.ADMIN || f.properties.NAME || "")
      .toString()
      .trim();
  }

  _countriesCache = json;
  return _countriesCache;
}

/**
 * Build an index for CO2 values by ISO3 and year.
 * Returns { years: number[], byIso: Map<ISO3, { [year]: { co2, co2_per_capita } }> }
 */
export async function fetchCO2Index() {
  if (_co2IndexCache && _yearsCache)
    return { years: _yearsCache, byIso: _co2IndexCache };

  const res = await fetch(OWID_CO2_CSV_URL);
  if (!res.ok) throw new Error("Failed to load local owid-co2-data.csv");
  const text = await res.text();

  // Robust CSV parse (handles BOM, large file)
  const { data } = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const byIso = new Map();
  const yearSet = new Set();

  for (const row of data) {
    // Columns we rely on (as in OWID CSV): iso_code, year, co2, co2_per_capita
    let iso = (row.iso_code ?? "").toString().trim().toUpperCase();
    const year = Number(row.year);

    if (!iso || !Number.isFinite(year)) continue;

    // Keep only three-letter country codes (skip OWID aggregates like "OWID_WRL")
    if (iso.length !== 3) continue;

    yearSet.add(year);

    const entry = byIso.get(iso) || {};
    entry[year] = {
      // OWID "co2": annual emissions in million tonnes (Mt)
      co2: toNum(row.co2),
      // OWID "co2_per_capita": tonnes per person (t)
      co2_per_capita: toNum(row.co2_per_capita),
    };
    byIso.set(iso, entry);
  }

  const years = [...yearSet].sort((a, b) => a - b);
  _yearsCache = years;
  _co2IndexCache = byIso;
  return { years, byIso };
}

function toNum(v) {
  if (v === null || v === undefined || v === "" || Number.isNaN(v)) return null;
  return Number(v);
}

/**
 * Keep only years where at least `minCountries` have a value for `metric`.
 * Returns [coveredYears, latestCoveredYear]
 */
export function filterYearsByCoverage(
  { years, byIso },
  metric,
  minCountries = 60
) {
  const counts = new Map();
  for (const [iso, yearly] of byIso.entries()) {
    for (const y of years) {
      const v = yearly?.[y]?.[metric];
      if (Number.isFinite(v)) counts.set(y, (counts.get(y) ?? 0) + 1);
    }
  }
  const covered = years.filter((y) => (counts.get(y) ?? 0) >= minCountries);
  const latest = covered.length
    ? covered[covered.length - 1]
    : years[years.length - 1];
  return [covered, latest];
}

/** Safe value getter */
export function getMetricValue(byIso, iso3, year, metric) {
  if (!byIso || !iso3 || !Number.isFinite(year)) return null;
  const rec = byIso.get(iso3)?.[year];
  const v = rec?.[metric];
  return Number.isFinite(v) ? v : null;
}
