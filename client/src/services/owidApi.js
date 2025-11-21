// Our World in Data (OWID) API integration for CO2 per capita data
// API Documentation: https://ourworldindata.org/co2-and-greenhouse-gas-emissions

import Papa from "papaparse";

const OWID_BASE_URL = "https://ourworldindata.org/grapher";

/**
 * Fetch CO2 per capita data from OWID
 * @returns {Promise<Map>} Map of {iso3: {year: perCapitaValue}}
 */
export async function fetchCO2PerCapitaData() {
  try {
    const url = `${OWID_BASE_URL}/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=true`;
    console.log("🌍 Fetching OWID per capita data:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MeltMonitor/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`OWID API error: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("📥 OWID CSV parsed:", results.data.length, "rows");

          // Build a nested map: iso3 -> year -> perCapitaValue
          const dataMap = new Map();

          results.data.forEach((row) => {
            const iso3 = row.Code; // ISO3 country code
            const year = parseInt(row.Year);
            const perCapita = parseFloat(row.emissions_total_per_capita);

            // Skip rows without valid data
            if (!iso3 || !year || !Number.isFinite(perCapita)) return;

            // Initialize country map if it doesn't exist
            if (!dataMap.has(iso3)) {
              dataMap.set(iso3, new Map());
            }

            // Store per capita value by year
            dataMap.get(iso3).set(year, perCapita);
          });

          console.log(
            "✅ Processed OWID data for",
            dataMap.size,
            "countries/entities"
          );

          // Log sample data for debugging
          const firstCountry = Array.from(dataMap.entries())[0];
          if (firstCountry) {
            const [iso3, yearMap] = firstCountry;
            const years = Array.from(yearMap.keys());
            console.log(
              `📊 Sample: ${iso3} has data for ${years.length} years (${Math.min(...years)}-${Math.max(...years)})`
            );
          }

          // Log a few specific countries for debugging
          console.log("🔍 Checking specific countries for year 2022:");
          ["USA", "CHN", "IND", "IDN", "DEU"].forEach((code) => {
            const countryData = dataMap.get(code);
            if (countryData) {
              const value2022 = countryData.get(2022);
              if (value2022) {
                console.log(`  ${code}: ${value2022.toFixed(2)} t/capita`);
              } else {
                const latestYear = Math.max(...Array.from(countryData.keys()));
                const latestValue = countryData.get(latestYear);
                console.log(
                  `  ${code}: NO 2022 data (latest: ${latestYear} = ${latestValue?.toFixed(2)} t)`
                );
              }
            } else {
              console.log(`  ${code}: NO DATA AT ALL`);
            }
          });

          resolve(dataMap);
        },
        error: (error) => {
          console.error("❌ Error parsing OWID CSV:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("❌ Error fetching OWID data:", error);
    throw error;
  }
}

/**
 * Get per capita value for a specific country and year
 * @param {Map} dataMap - The full OWID data map
 * @param {string} iso3 - ISO3 country code
 * @param {number} year - Year
 * @returns {number|null} Per capita CO2 emissions in tonnes, or null if not available
 */
export function getPerCapitaForCountry(dataMap, iso3, year) {
  if (!dataMap || !iso3 || !year) return null;

  const countryData = dataMap.get(iso3);
  if (!countryData) return null;

  return countryData.get(year) || null;
}

/**
 * Get per capita value with year fallback
 * @param {Map} dataMap - The full OWID data map
 * @param {string} iso3 - ISO3 country code
 * @param {number} year - Preferred year
 * @param {number} maxYearDiff - Maximum years to look back (default: 3)
 * @returns {Object|null} {value, actualYear} or null if not available
 */
export function getPerCapitaWithFallback(dataMap, iso3, year, maxYearDiff = 3) {
  if (!dataMap || !iso3 || !year) return null;

  const countryData = dataMap.get(iso3);
  if (!countryData) return null;

  // Try exact year first
  const exactValue = countryData.get(year);
  if (exactValue != null) {
    return { value: exactValue, actualYear: year };
  }

  // Fallback: find the most recent year within maxYearDiff
  const availableYears = Array.from(countryData.keys()).sort((a, b) => b - a);

  for (const availableYear of availableYears) {
    if (availableYear <= year && year - availableYear <= maxYearDiff) {
      const value = countryData.get(availableYear);
      if (value != null) {
        return { value, actualYear: availableYear };
      }
    }
  }

  return null;
}

/**
 * Get all countries' per capita data for a specific year
 * @param {Map} dataMap - The full OWID data map
 * @param {number} year - Year
 * @returns {Map} Map of iso3 -> perCapitaValue
 */
export function getPerCapitaForYear(dataMap, year) {
  const yearMap = new Map();

  if (!dataMap || !year) return yearMap;

  dataMap.forEach((yearData, iso3) => {
    const perCapita = yearData.get(year);
    if (perCapita != null) {
      yearMap.set(iso3, perCapita);
    }
  });

  return yearMap;
}

/**
 * Get available years for a country
 * @param {Map} dataMap - The full OWID data map
 * @param {string} iso3 - ISO3 country code
 * @returns {Array<number>} Array of years with data
 */
export function getAvailableYearsForCountry(dataMap, iso3) {
  if (!dataMap || !iso3) return [];

  const countryData = dataMap.get(iso3);
  if (!countryData) return [];

  return Array.from(countryData.keys()).sort((a, b) => a - b);
}

/**
 * Format per capita value for display
 * @param {number} value - Per capita CO2 in tonnes
 * @returns {string} Formatted string
 */
export function formatPerCapita(value) {
  if (!Number.isFinite(value)) return "—";

  if (value < 0.01) {
    return `${(value * 1000).toFixed(1)} kg`;
  } else if (value < 1) {
    return `${value.toFixed(2)} t`;
  } else {
    return `${value.toFixed(1)} t`;
  }
}
