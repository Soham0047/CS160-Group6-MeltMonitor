// Extended CO2 Data Service - Uses new datasets with data up to 2024
import Papa from "papaparse";

const ANNUAL_EMISSIONS_URL = "/data/annual-co2-emissions-per-country.csv";
const PER_CAPITA_EMISSIONS_URL = "/data/co-emissions-per-capita.csv";

function normalizeString(raw) {
  return raw ? String(raw).trim() : "";
}

function parseNumericValue(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === ".." || trimmed === "NA") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * Fetch and parse annual CO2 emissions (1949-2024)
 * @returns {Promise<{byIso: Map, years: number[], countryByIso: Map}>}
 */
export async function fetchAnnualEmissions() {
  console.log("📊 Fetching annual emissions data (1949-2024)...");
  const response = await fetch(ANNUAL_EMISSIONS_URL);
  if (!response.ok) {
    throw new Error(`Failed to load annual emissions: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const byIso = new Map(); // iso3 -> Map(year -> value)
        const countryByIso = new Map(); // iso3 -> country name
        const yearSet = new Set();

        console.log("📊 Parsing annual emissions, rows:", results.data.length);

        results.data.forEach((row) => {
          const countryName = normalizeString(row.Entity);
          const iso3 = normalizeString(row.Code);
          const year = parseNumericValue(row.Year);
          const emissions = parseNumericValue(row["Annual CO₂ emissions"]);

          if (!iso3 || !year || !emissions) return;

          // Store data
          if (!byIso.has(iso3)) {
            byIso.set(iso3, new Map());
            countryByIso.set(iso3, countryName);
          }

          byIso.get(iso3).set(year, emissions);
          yearSet.add(year);
        });

        const years = Array.from(yearSet).sort((a, b) => a - b);
        console.log("✅ Annual emissions parsed:", {
          countries: byIso.size,
          years: years.length,
          yearRange: `${years[0]}-${years[years.length - 1]}`,
        });

        resolve({ byIso, years, countryByIso });
      },
      error: (error) => {
        console.error("❌ Error parsing annual emissions:", error);
        reject(error);
      },
    });
  });
}

/**
 * Fetch and parse per capita CO2 emissions (1949-2024)
 * @returns {Promise<{byIso: Map, years: number[], countryByIso: Map}>}
 */
export async function fetchPerCapitaEmissions() {
  console.log("📊 Fetching per capita emissions data (1949-2024)...");
  const response = await fetch(PER_CAPITA_EMISSIONS_URL);
  if (!response.ok) {
    throw new Error(`Failed to load per capita emissions: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const byIso = new Map();
        const countryByIso = new Map();
        const yearSet = new Set();

        console.log(
          "📊 Parsing per capita emissions, rows:",
          results.data.length
        );

        results.data.forEach((row) => {
          const countryName = normalizeString(row.Entity);
          const iso3 = normalizeString(row.Code);
          const year = parseNumericValue(row.Year);
          const emissions = parseNumericValue(
            row["Annual CO₂ emissions (per capita)"]
          );

          if (!iso3 || !year || !emissions) return;

          if (!byIso.has(iso3)) {
            byIso.set(iso3, new Map());
            countryByIso.set(iso3, countryName);
          }

          byIso.get(iso3).set(year, emissions);
          yearSet.add(year);
        });

        const years = Array.from(yearSet).sort((a, b) => a - b);
        console.log("✅ Per capita emissions parsed:", {
          countries: byIso.size,
          years: years.length,
          yearRange: `${years[0]}-${years[years.length - 1]}`,
        });

        resolve({ byIso, years, countryByIso });
      },
      error: (error) => {
        console.error("❌ Error parsing per capita emissions:", error);
        reject(error);
      },
    });
  });
}

/**
 * Get emissions for a specific year across all countries
 */
export function getEmissionsForYear(byIso, year) {
  const result = new Map();
  if (!byIso || !year) return result;

  for (const [iso3, yearData] of byIso.entries()) {
    const value = yearData.get(year);
    if (value != null) {
      result.set(iso3, value);
    }
  }
  return result;
}

/**
 * Get global total emissions by year (for ML model)
 */
export async function getGlobalEmissionsTrend() {
  console.log("🌍 Computing global emissions trend...");
  const { byIso } = await fetchAnnualEmissions();

  // Get World data specifically
  const worldData = byIso.get("OWID_WRL");
  if (!worldData) {
    console.warn("⚠️ No World data found, aggregating all countries");
    return null;
  }

  const years = Array.from(worldData.keys()).sort((a, b) => a - b);
  const trend = years.map((year) => ({
    year,
    emissions: worldData.get(year),
  }));

  console.log("✅ Global trend computed:", {
    dataPoints: trend.length,
    yearRange: `${years[0]}-${years[years.length - 1]}`,
    latest: trend[trend.length - 1],
  });

  return trend;
}

/**
 * Format emissions value for display
 */
export function formatEmissions(value, isPerCapita = false) {
  if (!Number.isFinite(value)) return "—";

  if (isPerCapita) {
    // Per capita is in tonnes per person
    if (value < 0.01) {
      return `${(value * 1000).toFixed(0)} kg`;
    } else if (value < 1) {
      return `${value.toFixed(2)} t`;
    } else if (value < 10) {
      return `${value.toFixed(2)} t`;
    } else {
      return `${value.toFixed(1)} t`;
    }
  } else {
    // Total emissions in tonnes - convert to readable units
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)} Gt`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)} Mt`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)} kt`;
    } else {
      return `${value.toFixed(1)} t`;
    }
  }
}
