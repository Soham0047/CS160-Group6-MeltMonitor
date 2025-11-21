// Quick test to verify data loading works
import {
  fetchCountriesGeoJSON,
  fetchLocalIndex,
} from "./services/mapDataLocal.js";

async function testDataLoading() {
  console.log("=== Testing Data Loading ===");

  try {
    console.log("1. Loading GeoJSON...");
    const geo = await fetchCountriesGeoJSON();
    console.log("✓ GeoJSON loaded:", geo.features.length, "countries");
    console.log("Sample country:", geo.features[0].properties);

    console.log("\n2. Loading CO2 data index...");
    const index = await fetchLocalIndex();
    console.log("✓ Index loaded");
    console.log("  - Countries:", index.byIso.size);
    console.log("  - Years:", index.years.length);
    console.log(
      "  - Year range:",
      index.years[0],
      "-",
      index.years[index.years.length - 1]
    );

    // Test a specific country
    const usa = index.byIso.get("USA");
    if (usa) {
      console.log("\n3. Sample data for USA:");
      console.log("  - 2020:", usa[2020]);
      console.log("  - 2019:", usa[2019]);
    }

    console.log("\n=== All tests passed! ===");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testDataLoading();
