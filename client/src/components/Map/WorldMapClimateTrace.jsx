import { useEffect, useMemo, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

import { fetchCountriesGeoJSON } from "../../services/mapDataLocal";
import {
  fetchAllCountriesEmissions,
  getAvailableYears,
  formatEmissions,
} from "../../services/climateTraceApi";
import {
  fetchCO2PerCapitaData,
  getPerCapitaForYear,
  getPerCapitaWithFallback,
  formatPerCapita,
} from "../../services/owidApi";
import Legend from "./Legend";
import MetricControls from "./MetricControls";
import { rampRdYlGnReversed, scaleLinear } from "../../utils/color";

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 20,
  lng: 0,
};

const mapOptions = {
  zoom: 2,
  minZoom: 2,
  maxZoom: 8,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
  },
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function WorldMapClimateTrace() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState(null);
  const [emissionsData, setEmissionsData] = useState(null);
  const [perCapitaDataMap, setPerCapitaDataMap] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [year, setYear] = useState(undefined);
  const [metric, setMetric] = useState("co2"); // 'co2' or 'co2_pc'
  const [hover, setHover] = useState({ name: "—", iso3: null });
  const [selected, setSelected] = useState({ name: "—", iso3: null });
  const [map, setMap] = useState(null);
  const [dataLayer, setDataLayer] = useState(null);

  // Load GeoJSON and initial data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log("🌍 Loading data...");
        setLoading(true);
        setError(null);

        // Load GeoJSON
        const geo = await fetchCountriesGeoJSON();

        // Get available years from Climate TRACE
        const years = await getAvailableYears();
        const latestYear = years[years.length - 1] || 2022;

        // Load OWID per capita data (loads all years at once)
        console.log("📊 Loading OWID per capita data...");
        fetchCO2PerCapitaData()
          .then((perCapitaData) => {
            if (alive) {
              console.log("✅ OWID per capita data loaded");
              setPerCapitaDataMap(perCapitaData);
            }
          })
          .catch((e) => {
            console.error("⚠️ Failed to load OWID per capita data:", e);
            // Don't block the map from loading
            if (alive) {
              setPerCapitaDataMap(new Map()); // Set empty map so it's not null
            }
          });

        if (!alive) return;

        console.log("✅ GeoJSON loaded:", geo.features?.length, "countries");
        console.log("📅 Available years:", years);

        setCountries(geo);
        setAvailableYears(years);
        setYear(latestYear);
        setPerCapitaDataMap(new Map()); // Initialize with empty map

        // Load emissions data for latest year
        const emissions = await fetchAllCountriesEmissions({
          year: latestYear,
        });

        if (!alive) return;

        console.log(
          "📊 Emissions data loaded for",
          emissions.size,
          "countries"
        );
        setEmissionsData(emissions);
      } catch (e) {
        console.error("❌ Error loading data:", e);
        setError(e.message || "Failed to load data");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Reload emissions data when year changes
  useEffect(() => {
    if (!year || !availableYears.includes(year)) return;

    let alive = true;
    (async () => {
      try {
        console.log("🔄 Loading emissions for year:", year);
        const emissions = await fetchAllCountriesEmissions({ year });

        if (!alive) return;

        setEmissionsData(emissions);
        console.log(
          "✅ Updated emissions data for",
          emissions.size,
          "countries"
        );
      } catch (e) {
        console.error("❌ Error loading emissions:", e);
        setError(`Failed to load data for ${year}`);
      }
    })();

    return () => {
      alive = false;
    };
  }, [year, availableYears]);

  // Calculate color domain based on current metric
  const domain = useMemo(() => {
    if (metric === "co2") {
      // Total CO2 emissions domain
      if (!emissionsData || emissionsData.size === 0) return [0, 1, 2];

      const values = Array.from(emissionsData.values())
        .map((d) => d.co2_mt)
        .filter((v) => Number.isFinite(v) && v > 0);

      if (values.length === 0) return [0, 1, 2];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const mid = min + (max - min) / 2;

      console.log("📈 Total CO2 range:", { min, mid, max });
      return [min, mid, max];
    } else {
      // Per capita CO2 emissions domain
      if (!perCapitaDataMap || !year) return [0, 1, 2];

      const perCapitaYear = getPerCapitaForYear(perCapitaDataMap, year);
      const values = Array.from(perCapitaYear.values()).filter(
        (v) => Number.isFinite(v) && v > 0
      );

      if (values.length === 0) return [0, 1, 2];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const mid = min + (max - min) / 2;

      console.log("📈 Per capita CO2 range:", { min, mid, max });
      return [min, mid, max];
    }
  }, [emissionsData, perCapitaDataMap, year, metric]);

  // Style function
  const getFeatureStyle = useCallback(
    (feature) => {
      // The GeoJSON uses 'ISO3166-1-Alpha-3' for ISO3 codes
      const iso3 = feature.getProperty("ISO3166-1-Alpha-3");

      let value;
      if (metric === "co2") {
        // Total CO2
        const data = emissionsData?.get(iso3);
        value = data?.co2_mt;
      } else {
        // Per capita CO2 - use fallback logic
        const perCapitaResult = getPerCapitaWithFallback(
          perCapitaDataMap,
          iso3,
          year
        );
        value = perCapitaResult?.value;
      }

      const t = scaleLinear(domain[0], domain[2], value);
      const fill =
        value == null ? "rgba(160,160,160,0.3)" : rampRdYlGnReversed(t);

      return {
        fillColor: fill,
        fillOpacity: 0.8,
        strokeColor: "rgba(90,90,90,0.6)",
        strokeWeight: 0.5,
      };
    },
    [emissionsData, perCapitaDataMap, year, metric, domain]
  );

  // Map load callback
  const onLoad = useCallback(
    (mapInstance) => {
      console.log("🗺️ Google Map loaded");
      setMap(mapInstance);

      if (!countries) return;

      const layer = new window.google.maps.Data();
      layer.addGeoJson(countries);
      layer.setMap(mapInstance);
      setDataLayer(layer);

      layer.setStyle((feature) => getFeatureStyle(feature));

      // Hover events
      layer.addListener("mouseover", (event) => {
        const feature = event.feature;
        // The GeoJSON uses 'name' for country names and 'ISO3166-1-Alpha-3' for ISO3 codes
        const countryName = feature.getProperty("name") || "Unknown";
        const iso3 = feature.getProperty("ISO3166-1-Alpha-3") || "";

        console.log("🎯 Hover:", countryName, `(${iso3})`);

        // Debug per capita data for this country
        if (perCapitaDataMap && year) {
          const perCapitaResult = getPerCapitaWithFallback(
            perCapitaDataMap,
            iso3,
            year
          );

          console.log("🔍 Per Capita Debug:");
          console.log("  - Country:", countryName, `(${iso3})`);
          console.log("  - Requested year:", year);
          console.log("  - Fallback result:", perCapitaResult);

          if (perCapitaResult) {
            console.log(
              "  - ✅ Found value:",
              perCapitaResult.value.toFixed(2),
              "t/capita"
            );
            console.log("  - Actual year used:", perCapitaResult.actualYear);
            if (perCapitaResult.actualYear !== year) {
              console.log(
                "  - 📅 Used fallback year (requested",
                year,
                "-> actual",
                perCapitaResult.actualYear + ")"
              );
            }
          } else {
            // Check if country exists in full dataset
            const countryData = perCapitaDataMap.get(iso3);
            if (countryData) {
              const availableYears = Array.from(countryData.keys()).sort(
                (a, b) => b - a
              );
              console.log("  - ❌ No value found within 3 years");
              console.log("  - Country has", countryData.size, "years of data");
              console.log(
                "  - Available years:",
                availableYears.slice(0, 5),
                availableYears.length > 5 ? "..." : ""
              );
            } else {
              console.log("  - ❌ Country NOT in perCapitaDataMap");
              console.log(
                "  - Available countries:",
                Array.from(perCapitaDataMap.keys()).slice(0, 10)
              );
            }
          }
        }

        setHover({ name: countryName, iso3 });

        layer.overrideStyle(feature, {
          fillColor: "#FFD700",
          fillOpacity: 0.9,
          strokeColor: "#FF6B00",
          strokeWeight: 2,
        });
      });

      layer.addListener("mouseout", () => {
        console.log("👋 Hover off");
        setHover({ name: "—", iso3: null });
        layer.revertStyle();
      });

      layer.addListener("click", (event) => {
        const feature = event.feature;
        const countryName = feature.getProperty("name") || "Unknown";
        const iso3 = feature.getProperty("ISO3166-1-Alpha-3") || "";

        console.log("🖱️ Clicked:", countryName, `(ISO3: ${iso3})`);
        setSelected({ name: countryName, iso3 });
      });
    },
    [countries, getFeatureStyle]
  );

  // Update styles when data or metric changes
  useEffect(() => {
    if (!dataLayer || !emissionsData) return;

    console.log("🎨 Updating map colors for metric:", metric);
    dataLayer.setStyle((feature) => getFeatureStyle(feature));
  }, [dataLayer, emissionsData, perCapitaDataMap, metric, getFeatureStyle]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Error states
  if (loadError) {
    return (
      <Box sx={{ height: 560, display: "grid", placeItems: "center", p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Google Maps Error</Typography>
          <Typography>{loadError.message}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!isLoaded || loading || !countries || !emissionsData || !year) {
    return (
      <Box sx={{ height: 560, display: "grid", placeItems: "center", p: 3 }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {!isLoaded
                ? "Loading Google Maps..."
                : "Loading emissions data..."}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const hoverData = emissionsData.get(hover.iso3);
  const selectedData = emissionsData.get(selected.iso3);

  // Get per capita data for hover and selected with fallback
  const hoverPerCapitaResult = hover.iso3
    ? getPerCapitaWithFallback(perCapitaDataMap, hover.iso3, year)
    : null;
  const selectedPerCapitaResult = selected.iso3
    ? getPerCapitaWithFallback(perCapitaDataMap, selected.iso3, year)
    : null;

  const hoverPerCapita = hoverPerCapitaResult?.value;
  const selectedPerCapita = selectedPerCapitaResult?.value;

  // For map coloring, we still need the year map
  const perCapitaYear = perCapitaDataMap
    ? getPerCapitaForYear(perCapitaDataMap, year)
    : new Map();

  return (
    <Box sx={{ position: "relative", height: "clamp(520px, 70vh, 800px)" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />

      {/* Year Slider Controls */}
      <MetricControls
        metric={metric}
        setMetric={setMetric}
        year={year}
        setYear={setYear}
        yearRange={[
          availableYears[0],
          availableYears[availableYears.length - 1],
        ]}
      />

      {/* Selected Country Panel */}
      <Box
        sx={{
          position: "absolute",
          top: 110,
          left: 16,
          zIndex: 1000,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: 3,
          width: 300,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          SELECTED
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {selected.name}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Total CO₂ ({year})
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          {selectedData ? formatEmissions(selectedData.co2_mt, "Mt") : "—"}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Per Capita CO₂ (
          {selectedPerCapitaResult ? selectedPerCapitaResult.actualYear : year})
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {selectedPerCapita != null ? formatPerCapita(selectedPerCapita) : "—"}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Sources: Climate TRACE & OWID
        </Typography>
      </Box>

      {/* Hover Panel */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1000,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 2,
          p: 1.5,
          boxShadow: 3,
          width: 280,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          HOVERING OVER
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: hover.name === "—" ? "text.secondary" : "text.primary",
          }}
        >
          {hover.name}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Total CO₂ ({year})
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          {hoverData ? formatEmissions(hoverData.co2_mt, "Mt") : "—"}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Per Capita CO₂ (
          {hoverPerCapitaResult ? hoverPerCapitaResult.actualYear : year})
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {hoverPerCapita != null ? formatPerCapita(hoverPerCapita) : "—"}
        </Typography>
      </Box>

      <Legend
        min={domain[0]}
        mid={domain[1]}
        max={domain[2]}
        label={metric === "co2" ? "Total CO₂ (Mt)" : "Per Capita CO₂ (t)"}
      />
    </Box>
  );
}
