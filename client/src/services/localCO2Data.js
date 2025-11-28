// Local CO2 Emissions data service (1960-2018)
// Data sources:
//   - Total emissions: CO2_Emissions_1960-2018.csv (tonnes)
//   - Per-capita emissions: co2_emissions.csv (tonnes per person)

import Papa from "papaparse";

const TOTAL_EMISSIONS_DATA_URL = "/data/CO2_Emissions_1960-2018.csv";
const PER_CAPITA_DATA_URL = "/data/co2_emissions.csv";

function normaliseString(raw) {
  return raw ? String(raw).trim() : "";
}

function parseNumericValue(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === "..") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function safeYearColumns(fields = []) {
  return fields.filter((field) => /^\d{4}$/.test(field)).map(Number);
}

/**
 * Fetch and parse the local CO2 emissions dataset
 * @returns {Promise<{ byIso: Map<string, Map<number, number>>, years: number[], countryByIso: Map<string, string> }>
 */
export async function fetchLocalCO2Data() {
  try {
    const response = await fetch(TOTAL_EMISSIONS_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Build nested map: iso3 -> Map(year -> value)
          const byIso = new Map();
          const countryByIso = new Map();
          const yearColumns = safeYearColumns(results.meta?.fields);
          const yearSet = new Set();

          console.log("CSV fields:", results.meta?.fields);
          console.log("Year columns found:", yearColumns);
          console.log("Total rows:", results.data?.length);

          results.data.forEach((row) => {
            // This CSV has Country Name column, but no Country Code
            // We need to map country names to ISO3 codes
            const countryName = normaliseString(
              row["Country Name"] || row.country || row.name
            );

            if (!countryName) return;

            // Map country name to ISO3 using COUNTRY_NAME_TO_ISO3
            const iso3 = COUNTRY_NAME_TO_ISO3[countryName];
            if (!iso3) {
              console.log("No ISO3 mapping for country:", countryName);
              return;
            }

            const yearData = byIso.get(iso3) || new Map();

            yearColumns.forEach((year) => {
              const value = parseNumericValue(row[year]);
              if (value != null) {
                yearData.set(year, value);
                yearSet.add(year);
              }
            });

            if (yearData.size > 0) {
              byIso.set(iso3, yearData);
              countryByIso.set(iso3, countryName);
            }
          });

          console.log("Parsed countries:", byIso.size, "years:", yearSet.size);
          resolve({
            byIso,
            years: [...yearSet].sort((a, b) => a - b),
            countryByIso,
          });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error loading local CO2 data:", error);
    throw error;
  }
}

/**
 * Get all countries' emissions for a specific year
 * @param {Map} dataMap - The full data map
 * @param {number} year - Year to retrieve
 * @returns {Map} Map of countryName -> emissions value
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

export function getAvailableYears(dataset) {
  if (!dataset || !Array.isArray(dataset.years)) return [];
  return dataset.years;
}

export function getEmissionForCountry(byIso, iso3, year) {
  if (!byIso || !iso3 || !year) return null;
  return byIso.get(iso3)?.get(year) ?? null;
}

/**
 * Fetch and parse the per capita CO2 emissions dataset
 * @returns {Promise<Map>} Map of {countryName: {year: perCapitaValue}}
 */
export async function fetchPerCapitaCO2Data() {
  try {
    const response = await fetch(PER_CAPITA_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Build nested map: countryName -> year -> perCapitaValue
          const byIso = new Map();
          const countryByIso = new Map();
          const yearColumns = safeYearColumns(results.meta?.fields);
          const yearSet = new Set();

          console.log("Per capita CSV fields:", results.meta?.fields);
          console.log("Per capita year columns found:", yearColumns);
          console.log("Per capita total rows:", results.data?.length);

          results.data.forEach((row) => {
            // This CSV has "country" column, not "Country Code"
            const countryName = normaliseString(
              row.country || row["Country Name"] || row.name
            );

            if (!countryName) return;

            // Map country name to ISO3 using COUNTRY_NAME_TO_ISO3
            const iso3 = COUNTRY_NAME_TO_ISO3[countryName];
            if (!iso3) {
              console.log(
                "No ISO3 mapping for per capita country:",
                countryName
              );
              return;
            }

            const yearData = byIso.get(iso3) || new Map();

            yearColumns.forEach((year) => {
              const value = parseNumericValue(row[year]);
              if (value != null) {
                yearData.set(year, value);
                yearSet.add(year);
              }
            });

            if (yearData.size > 0) {
              byIso.set(iso3, yearData);
              countryByIso.set(iso3, countryName);
            }
          });

          console.log(
            "Per capita parsed countries:",
            byIso.size,
            "years:",
            yearSet.size
          );
          resolve({
            byIso,
            years: [...yearSet].sort((a, b) => a - b),
            countryByIso,
          });
        },
        error: (error) => {
          console.error("Error parsing per capita CSV:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error loading per capita CO2 data:", error);
    throw error;
  }
}

/**
 * Format emissions value for display
 * @param {number} value - Emissions value
 * @param {boolean} isPerCapita - Whether this is per capita data
 * @returns {string} Formatted string
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
    // Total emissions
    if (value < 1) {
      return `${value.toFixed(3)} t`;
    } else if (value < 10) {
      return `${value.toFixed(2)} t`;
    } else {
      return `${value.toFixed(1)} t`;
    }
  }
}

/**
 * Create a country name to ISO3 mapping helper
 * Comprehensive mapping for CO2 emissions datasets
 */
export const COUNTRY_NAME_TO_ISO3 = {
  "United States": "USA",
  China: "CHN",
  India: "IND",
  Russia: "RUS",
  Japan: "JPN",
  Germany: "DEU",
  Iran: "IRN",
  "South Korea": "KOR",
  "Saudi Arabia": "SAU",
  Indonesia: "IDN",
  Canada: "CAN",
  Mexico: "MEX",
  "South Africa": "ZAF",
  Brazil: "BRA",
  Turkey: "TUR",
  Australia: "AUS",
  "United Kingdom": "GBR",
  Italy: "ITA",
  France: "FRA",
  Poland: "POL",
  Thailand: "THA",
  Pakistan: "PAK",
  Ukraine: "UKR",
  Spain: "ESP",
  Argentina: "ARG",
  Egypt: "EGY",
  Vietnam: "VNM",
  Malaysia: "MYS",
  Netherlands: "NLD",
  Iraq: "IRQ",
  Afghanistan: "AFG",
  Albania: "ALB",
  Algeria: "DZA",
  "American Samoa": "ASM",
  Andorra: "AND",
  Angola: "AGO",
  "Antigua and Barbuda": "ATG",
  Armenia: "ARM",
  Aruba: "ABW",
  Austria: "AUT",
  Azerbaijan: "AZE",
  Bahamas: "BHS",
  "Bahamas, The": "BHS",
  Bahrain: "BHR",
  Bangladesh: "BGD",
  Barbados: "BRB",
  Belarus: "BLR",
  Belgium: "BEL",
  Belize: "BLZ",
  Benin: "BEN",
  Bermuda: "BMU",
  Bhutan: "BTN",
  Bolivia: "BOL",
  "Bosnia and Herzegovina": "BIH",
  Botswana: "BWA",
  "British Virgin Islands": "VGB",
  "Brunei Darussalam": "BRN",
  Brunei: "BRN",
  Bulgaria: "BGR",
  "Burkina Faso": "BFA",
  Burundi: "BDI",
  "Cabo Verde": "CPV",
  "Cape Verde": "CPV",
  Cambodia: "KHM",
  Cameroon: "CMR",
  "Cayman Islands": "CYM",
  "Central African Republic": "CAF",
  Chad: "TCD",
  "Channel Islands": "GBR",
  Chile: "CHL",
  Colombia: "COL",
  Comoros: "COM",
  "Congo, Dem. Rep.": "COD",
  "Congo, Rep.": "COG",
  Congo: "COG",
  "Democratic Republic of Congo": "COD",
  "Republic of the Congo": "COG",
  "Democratic Republic of the Congo": "COD",
  "Costa Rica": "CRI",
  "Cote d'Ivoire": "CIV",
  "Côte d'Ivoire": "CIV",
  "Ivory Coast": "CIV",
  Croatia: "HRV",
  Cuba: "CUB",
  Curacao: "CUW",
  Curaçao: "CUW",
  Cyprus: "CYP",
  Czechia: "CZE",
  "Czech Republic": "CZE",
  Denmark: "DNK",
  Djibouti: "DJI",
  Dominica: "DMA",
  "Dominican Republic": "DOM",
  Ecuador: "ECU",
  "Egypt, Arab Rep.": "EGY",
  "El Salvador": "SLV",
  "Equatorial Guinea": "GNQ",
  Eritrea: "ERI",
  Estonia: "EST",
  Eswatini: "SWZ",
  Swaziland: "SWZ",
  Ethiopia: "ETH",
  "Faroe Islands": "FRO",
  Fiji: "FJI",
  Finland: "FIN",
  "French Polynesia": "PYF",
  Gabon: "GAB",
  "Gambia, The": "GMB",
  Gambia: "GMB",
  Georgia: "GEO",
  Ghana: "GHA",
  Gibraltar: "GIB",
  Greece: "GRC",
  Greenland: "GRL",
  Grenada: "GRD",
  Guam: "GUM",
  Guatemala: "GTM",
  Guinea: "GIN",
  "Guinea-Bissau": "GNB",
  Guyana: "GUY",
  Haiti: "HTI",
  Honduras: "HND",
  "Hong Kong SAR, China": "HKG",
  "Hong Kong SAR": "HKG",
  "Hong Kong": "HKG",
  Hungary: "HUN",
  Iceland: "ISL",
  "Iran, Islamic Rep.": "IRN",
  Iran: "IRN",
  Ireland: "IRL",
  "Isle of Man": "IMN",
  Israel: "ISR",
  Jamaica: "JAM",
  Jordan: "JOR",
  Kazakhstan: "KAZ",
  Kenya: "KEN",
  Kiribati: "KIR",
  "Korea, Dem. People's Rep.": "PRK",
  "North Korea": "PRK",
  "Korea, Rep.": "KOR",
  "South Korea": "KOR",
  Kosovo: "XKX",
  Kuwait: "KWT",
  "Kyrgyz Republic": "KGZ",
  Kyrgyzstan: "KGZ",
  "Lao PDR": "LAO",
  Laos: "LAO",
  Latvia: "LVA",
  Lebanon: "LBN",
  Lesotho: "LSO",
  Liberia: "LBR",
  Libya: "LBY",
  Liechtenstein: "LIE",
  Lithuania: "LTU",
  Luxembourg: "LUX",
  "Macao SAR, China": "MAC",
  "Macao SAR": "MAC",
  Macao: "MAC",
  Macau: "MAC",
  Madagascar: "MDG",
  Malawi: "MWI",
  Maldives: "MDV",
  Mali: "MLI",
  Malta: "MLT",
  "Marshall Islands": "MHL",
  Mauritania: "MRT",
  Mauritius: "MUS",
  "Micronesia, Fed. Sts.": "FSM",
  Micronesia: "FSM",
  Moldova: "MDA",
  Monaco: "MCO",
  Mongolia: "MNG",
  Montenegro: "MNE",
  Morocco: "MAR",
  Mozambique: "MOZ",
  Myanmar: "MMR",
  Namibia: "NAM",
  Nauru: "NRU",
  Nepal: "NPL",
  "New Caledonia": "NCL",
  "New Zealand": "NZL",
  Nicaragua: "NIC",
  Niger: "NER",
  Nigeria: "NGA",
  "North Macedonia": "MKD",
  Macedonia: "MKD",
  "Northern Mariana Islands": "MNP",
  Norway: "NOR",
  Oman: "OMN",
  Palau: "PLW",
  Panama: "PAN",
  "Papua New Guinea": "PNG",
  Paraguay: "PRY",
  Peru: "PER",
  Philippines: "PHL",
  Portugal: "PRT",
  "Puerto Rico": "PRI",
  Qatar: "QAT",
  Romania: "ROU",
  "Russian Federation": "RUS",
  Russia: "RUS",
  Rwanda: "RWA",
  Samoa: "WSM",
  "San Marino": "SMR",
  "Sao Tome and Principe": "STP",
  "São Tomé and Príncipe": "STP",
  Senegal: "SEN",
  Serbia: "SRB",
  Seychelles: "SYC",
  "Sierra Leone": "SLE",
  Singapore: "SGP",
  "Sint Maarten (Dutch part)": "SXM",
  "Slovak Republic": "SVK",
  Slovakia: "SVK",
  Slovenia: "SVN",
  "Solomon Islands": "SLB",
  Somalia: "SOM",
  "South Sudan": "SSD",
  "Sri Lanka": "LKA",
  "St. Kitts and Nevis": "KNA",
  "Saint Kitts and Nevis": "KNA",
  "St. Lucia": "LCA",
  "Saint Lucia": "LCA",
  "St. Martin (French part)": "MAF",
  "Saint Pierre and Miquelon": "SPM",
  "St. Vincent and the Grenadines": "VCT",
  "Saint Vincent and the Grenadines": "VCT",
  Sudan: "SDN",
  Suriname: "SUR",
  Sweden: "SWE",
  Switzerland: "CHE",
  "Syrian Arab Republic": "SYR",
  Syria: "SYR",
  Tajikistan: "TJK",
  Tanzania: "TZA",
  "Timor-Leste": "TLS",
  "East Timor": "TLS",
  Togo: "TGO",
  Tonga: "TON",
  "Trinidad and Tobago": "TTO",
  Tunisia: "TUN",
  Türkiye: "TUR",
  Turkmenistan: "TKM",
  "Turks and Caicos Islands": "TCA",
  Tuvalu: "TUV",
  Uganda: "UGA",
  "United Arab Emirates": "ARE",
  "United States of America": "USA",
  Uruguay: "URY",
  Uzbekistan: "UZB",
  Vanuatu: "VUT",
  "Venezuela, RB": "VEN",
  Venezuela: "VEN",
  "Virgin Islands (U.S.)": "VIR",
  "United States Virgin Islands": "VIR",
  "West Bank and Gaza": "PSE",
  Palestine: "PSE",
  Yemen: "YEM",
  "Yemen, Rep.": "YEM",
  Zambia: "ZMB",
  Zimbabwe: "ZWE",
  // Add more mappings as needed
};
