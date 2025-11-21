// Climate TRACE API integration for real-time CO2 emissions data
// API Documentation: https://api.climatetrace.org/v6/swagger/index.html

const CLIMATE_TRACE_BASE_URL = "https://api.climatetrace.org/v6";

/**
 * Fetch CO2 emissions data by country
 * @param {Object} params - Query parameters
 * @param {string} params.country - ISO3 country code (e.g., 'USA', 'CHN')
 * @param {number} params.since - Start year (e.g., 2015)
 * @param {number} params.to - End year (e.g., 2023)
 * @param {string} params.sector - Specific sector or 'all' for total
 * @returns {Promise<Object>} Emissions data
 */
export async function fetchCountryEmissions({
  country,
  since,
  to,
  sector = "all",
}) {
  try {
    const params = new URLSearchParams({
      country,
      since: since || 2015,
      to: to || new Date().getFullYear() - 1,
    });

    if (sector && sector !== "all") {
      params.append("sector", sector);
    }

    const url = `${CLIMATE_TRACE_BASE_URL}/emissions?${params.toString()}`;
    console.log("Fetching Climate TRACE data:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Climate TRACE API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Climate TRACE data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching Climate TRACE data:", error);
    throw error;
  }
}

/**
 * Get list of all country codes from Climate TRACE API
 * @returns {Promise<Array<string>>} Array of ISO3 country codes
 */
export async function fetchCountryCodes() {
  try {
    const url = `${CLIMATE_TRACE_BASE_URL}/definitions/countries`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Climate TRACE API error: ${response.status}`);
    }

    const data = await response.json();

    // The API returns an array of country objects with alpha3, alpha2, name, continent
    if (Array.isArray(data)) {
      return data.map((country) => country.alpha3).filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error("Error fetching country codes:", error);
    // Return a fallback list of major countries if the API fails
    return [
      "USA",
      "CHN",
      "IND",
      "RUS",
      "JPN",
      "DEU",
      "IRN",
      "KOR",
      "SAU",
      "IDN",
      "CAN",
      "MEX",
      "ZAF",
      "BRA",
      "TUR",
      "AUS",
      "GBR",
      "ITA",
      "FRA",
      "POL",
      "THA",
      "PAK",
      "UKR",
      "ESP",
      "ARG",
      "EGY",
      "VNM",
      "MYS",
      "NLD",
      "IRQ",
    ];
  }
}

/**
 * Fetch all countries' emissions data
 * @param {Object} params - Query parameters
 * @param {number} params.year - Year to fetch data for
 * @returns {Promise<Map>} Map of ISO3 code to emissions data
 */
export async function fetchAllCountriesEmissions({ year }) {
  try {
    // First, get the list of all country codes
    console.log("🌍 Fetching country codes...");
    const countryCodes = await fetchCountryCodes();
    console.log(`📋 Got ${countryCodes.length} country codes`);

    // The Climate TRACE API requires country codes to be passed as a comma-separated list
    // We'll batch them to avoid URL length limits (roughly 50 countries per batch)
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < countryCodes.length; i += batchSize) {
      batches.push(countryCodes.slice(i, i + batchSize));
    }

    console.log(
      `🔄 Fetching emissions in ${batches.length} batches for year ${year}...`
    );

    // Fetch all batches
    const emissionsMap = new Map();

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const countriesParam = batch.join(",");
      const url = `${CLIMATE_TRACE_BASE_URL}/country/emissions?since=${year}&to=${year}&countries=${countriesParam}`;

      console.log(
        `📥 Batch ${i + 1}/${batches.length}: ${batch.length} countries`
      );

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`⚠️ Batch ${i + 1} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        data.forEach((countryData) => {
          const iso3 = countryData.country;

          // Skip global aggregates (country: "all")
          if (!iso3 || iso3 === "all") return;

          // Extract emissions from nested object
          const emissions = countryData.emissions || {};

          emissionsMap.set(iso3, {
            iso3: iso3,
            co2: emissions.co2 || 0, // in tonnes
            co2_mt: (emissions.co2 || 0) / 1_000_000, // Convert to megatonnes
            ch4: emissions.ch4 || 0,
            n2o: emissions.n2o || 0,
            co2e_100yr: emissions.co2e_100yr || 0,
            co2e_20yr: emissions.co2e_20yr || 0,
            year: year,
            rank: countryData.rank,
          });
        });
      }
    }

    console.log(
      "✅ Processed emissions data for",
      emissionsMap.size,
      "countries"
    );

    // Log a few samples for debugging
    const samples = Array.from(emissionsMap.entries()).slice(0, 3);
    if (samples.length > 0) {
      console.log("📊 Sample data:");
      samples.forEach(([iso3, data]) => {
        console.log(`  ${iso3}: ${data.co2_mt.toFixed(2)} Mt CO2`);
      });
    }

    return emissionsMap;
  } catch (error) {
    console.error("❌ Error fetching all countries emissions:", error);
    throw error;
  }
}

/**
 * Get available years from Climate TRACE API
 * @returns {Promise<Array<number>>} Array of available years
 */
export async function getAvailableYears() {
  try {
    // Climate TRACE typically has data from 2015 onwards
    // Current year data might not be complete, so we go to last year
    const currentYear = new Date().getFullYear();
    const years = [];

    // Climate TRACE has data from 2015 to last complete year
    // Since OWID often has data 1-2 years behind, we align to 2022 as latest
    const latestYear = Math.min(currentYear - 2, 2022);

    for (let year = 2015; year <= latestYear; year++) {
      years.push(year);
    }

    console.log(
      `📅 Climate TRACE available years: ${years[0]}-${years[years.length - 1]}`
    );
    return years;
  } catch (error) {
    console.error("Error getting available years:", error);
    return [];
  }
}

/**
 * Fetch emissions by sector for a country
 * @param {Object} params
 * @param {string} params.country - ISO3 country code
 * @param {number} params.year - Year
 * @returns {Promise<Array>} Array of sector emissions
 */
export async function fetchCountrySectorEmissions({ country, year }) {
  try {
    const url = `${CLIMATE_TRACE_BASE_URL}/country/${country}/emissions?year=${year}`;
    console.log("Fetching sector emissions:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Climate TRACE API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sector emissions:", error);
    return [];
  }
}

/**
 * Calculate per capita emissions
 * @param {number} totalEmissions - Total emissions in tonnes
 * @param {number} population - Country population
 * @returns {number} Per capita emissions in tonnes
 */
export function calculatePerCapita(totalEmissions, population) {
  if (!population || population === 0) return 0;
  return totalEmissions / population;
}

/**
 * Format emissions value for display
 * @param {number} value - Emissions value
 * @param {string} unit - Unit (Mt, t, kg)
 * @returns {string} Formatted string
 */
export function formatEmissions(value, unit = "Mt") {
  if (!Number.isFinite(value)) return "—";

  switch (unit) {
    case "Mt":
      return `${Math.round(value).toLocaleString()} Mt`;
    case "t":
      return `${value.toFixed(2)} t`;
    case "kg":
      return `${Math.round(value).toLocaleString()} kg`;
    default:
      return `${value.toFixed(2)} ${unit}`;
  }
}
