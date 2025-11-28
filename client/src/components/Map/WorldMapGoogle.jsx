import { useEffect, useMemo, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Data } from "@react-google-maps/api";
import { Box, CircularProgress, Typography } from "@mui/material";

import {
  fetchCountriesGeoJSON,
  fetchLocalIndex,
  filterYearsByCoverage,
  getMetricValue,
} from "../../services/mapDataLocal";
import Legend from "./Legend";
import MetricControls from "./MetricControls";
import { rampRdYlGnReversed, scaleLinear } from "../../utils/color";

// NOTE: You'll need to add your Google Maps API key here or via environment variable
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

export default function WorldMapGoogle() {
  // Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState(null);
  const [idx, setIdx] = useState(null);
  const [metric, setMetric] = useState("co2");
  const [year, setYear] = useState(undefined);
  const [yearRange, setYearRange] = useState([1960, 2020]);
  const [hover, setHover] = useState({ name: "—", iso3: null });
  const [selected, setSelected] = useState({ name: "—", iso3: null });
  const [map, setMap] = useState(null);
  const [dataLayer, setDataLayer] = useState(null);

  // load local data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log("WorldMapGoogle: Starting data load...");
        setLoading(true);
        setError(null);

        const [geo, index] = await Promise.all([
          fetchCountriesGeoJSON(),
          fetchLocalIndex(),
        ]);

        if (!alive) return;

        console.log("WorldMapGoogle: Data loaded successfully");
        console.log("  - Countries:", geo.features?.length);
        console.log("  - Index countries:", index.byIso?.size);

        setCountries(geo);
        setIdx(index);

        const [covered, latest] = filterYearsByCoverage(
          index,
          "co2_per_capita",
          40
        );

        const minY = covered[0] ?? index.years[0];
        const maxY = covered.at(-1) ?? index.years.at(-1);

        setYearRange([minY, maxY]);
        setYear(latest);

        console.log("WorldMapGoogle: Initialization complete!");
      } catch (e) {
        console.error("WorldMapGoogle: Error loading data:", e);
        setError(e.message || "Failed to load local data");
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

  // recompute coverage when metric changes
  useEffect(() => {
    if (!idx) return;
    const [covered, latest] = filterYearsByCoverage(idx, metric, 40);
    const minY = covered[0] ?? idx.years[0];
    const maxY = covered.at(-1) ?? idx.years.at(-1);
    setYearRange([minY, maxY]);
    setYear((prev) =>
      typeof prev === "number" && prev >= minY && prev <= maxY ? prev : latest
    );
  }, [metric, idx]);

  // color domain
  const domain = useMemo(() => {
    if (!countries || !idx || typeof year !== "number") return [0, 1, 2];
    const vals = [];
    for (const f of countries.features) {
      const iso3 = f.properties.ISO3;
      const v = getMetricValue(idx.byIso, iso3, year, metric);
      if (v != null) vals.push(v);
    }
    if (!vals.length) return [0, 1, 2];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mid = min + (max - min) / 2;
    return min === max ? [min, min + 0.5, min + 1] : [min, mid, max];
  }, [countries, idx, metric, year]);

  // style function for features
  const getFeatureStyle = useCallback(
    (feature) => {
      const iso3 = feature.getProperty("ISO3");
      const val = getMetricValue(idx?.byIso, iso3, year, metric);
      const t = scaleLinear(domain[0], domain[2], val);
      const fill =
        val == null ? "rgba(160,160,160,0.3)" : rampRdYlGnReversed(t);

      return {
        fillColor: fill,
        fillOpacity: 0.8,
        strokeColor: "rgba(90,90,90,0.6)",
        strokeWeight: 0.5,
      };
    },
    [idx, year, metric, domain]
  );

  // Map load callback
  const onLoad = useCallback(
    (mapInstance) => {
      console.log("Google Map loaded");
      setMap(mapInstance);

      if (!countries) return;

      // Add GeoJSON data layer
      const layer = new window.google.maps.Data();
      layer.addGeoJson(countries);
      layer.setMap(mapInstance);
      setDataLayer(layer);

      // Apply initial styles
      layer.setStyle((feature) => getFeatureStyle(feature));

      // Mouse over event
      layer.addListener("mouseover", (event) => {
        const feature = event.feature;

        // Try multiple property names that might contain the country name
        const countryName =
          feature.getProperty("COUNTRY") ||
          feature.getProperty("ADMIN") ||
          feature.getProperty("NAME") ||
          feature.getProperty("name") ||
          feature.getProperty("NAME_LONG") ||
          "Unknown Country";

        const iso3 =
          feature.getProperty("ISO3") ||
          feature.getProperty("ISO_A3") ||
          feature.getProperty("ISO_A3_EH") ||
          "";

        // Debug: Log all available properties
        console.log("🎯 Hover ON:", countryName, `(${iso3})`);
        console.log("Available properties:", {
          COUNTRY: feature.getProperty("COUNTRY"),
          ADMIN: feature.getProperty("ADMIN"),
          NAME: feature.getProperty("NAME"),
          ISO3: feature.getProperty("ISO3"),
          ISO_A3: feature.getProperty("ISO_A3"),
        });

        // Update hover state with country info
        setHover({ name: countryName, iso3 });

        // Highlight with gold color
        layer.overrideStyle(feature, {
          fillColor: "#FFD700",
          fillOpacity: 0.9,
          strokeColor: "#FF6B00",
          strokeWeight: 2,
        });
      });

      // Mouse out event
      layer.addListener("mouseout", (event) => {
        console.log("👋 Hover OFF");

        // Reset hover state
        setHover({ name: "—", iso3: null });

        // Reset to original style
        layer.revertStyle();
      });

      // Click event
      layer.addListener("click", (event) => {
        const feature = event.feature;
        const countryName = feature.getProperty("COUNTRY");
        const iso3 = feature.getProperty("ISO3");

        console.log("Clicked:", countryName, iso3);
        setSelected({ name: countryName, iso3 });
      });
    },
    [countries, getFeatureStyle]
  );

  // Update styles when metric/year changes
  useEffect(() => {
    if (!dataLayer || !idx || typeof year !== "number") return;

    console.log("Updating map styles for year:", year, "metric:", metric);
    dataLayer.setStyle((feature) => getFeatureStyle(feature));
  }, [dataLayer, idx, year, metric, getFeatureStyle]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Loading states
  if (loadError) {
    const isApiNotActivated = loadError.message?.includes(
      "ApiNotActivatedMapError"
    );
    const isMissingKey = GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE";

    return (
      <Box sx={{ height: 560, display: "grid", placeItems: "center", p: 3 }}>
        <Box sx={{ textAlign: "center", maxWidth: 600 }}>
          <Typography color="error" variant="h6" gutterBottom>
            Google Maps Setup Required
          </Typography>

          {isMissingKey ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                ⚠️ No API key found. Please add your Google Maps API key to the
                .env file.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                1. Open <code>client/.env</code>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                2. Replace YOUR_API_KEY_HERE with your actual API key
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Restart the dev server
              </Typography>
            </>
          ) : isApiNotActivated ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                ⚠️ Maps JavaScript API is not activated for your project
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Steps to fix:</strong>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: "left" }}
              >
                1. Go to{" "}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener"
                >
                  Google Cloud Console
                </a>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: "left" }}
              >
                2. Select your project or create a new one
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: "left" }}
              >
                3. Go to "APIs & Services" → "Library"
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: "left" }}
              >
                4. Search for "Maps JavaScript API"
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "left" }}
              >
                5. Click "Enable"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                See GOOGLE_MAPS_SETUP.md for detailed instructions
              </Typography>
            </>
          ) : (
            <Typography color="error">{loadError.message}</Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (!isLoaded || loading || !countries || !idx || typeof year !== "number") {
    return (
      <Box sx={{ height: 560, display: "grid", placeItems: "center", p: 3 }}>
        {error ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography color="error" variant="h6" gutterBottom>
              Error Loading Map Data
            </Typography>
            <Typography color="error">{String(error)}</Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {!isLoaded ? "Loading Google Maps..." : "Loading map data..."}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const selectedTotal = getMetricValue(idx.byIso, selected.iso3, year, "co2");
  const selectedPerCap = getMetricValue(
    idx.byIso,
    selected.iso3,
    year,
    "co2_per_capita"
  );

  return (
    <Box sx={{ position: "relative", height: "clamp(520px, 70vh, 800px)" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />

      {/* Controls */}
      <MetricControls
        metric={metric}
        setMetric={setMetric}
        year={year}
        setYear={setYear}
        yearRange={yearRange}
      />

      {/* Selection panel */}
      <Box
        sx={{
          position: "absolute",
          top: 110,
          left: 16,
          zIndex: 1000,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 2,
          p: 1.25,
          boxShadow: 2,
          width: 300,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Selected
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {selected.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Total CO₂
        </Typography>
        <Typography variant="body2">
          {fmtVal(selectedTotal, "Mt", year)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          CO₂ per capita
        </Typography>
        <Typography variant="body2">
          {fmtVal(selectedPerCap, "t", year)}
        </Typography>
      </Box>

      {/* Hover panel (top-right) */}
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
          minHeight: 100,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5 }}
        >
          HOVERING OVER
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            fontSize: "1.1rem",
            color: hover.name === "—" ? "text.secondary" : "text.primary",
          }}
        >
          {hover.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.25 }}
        >
          {metric === "co2" ? "Total CO₂" : "CO₂ per capita"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {fmtVal(
            getMetricValue(idx.byIso, hover.iso3, year, metric),
            metric === "co2" ? "Mt" : "t",
            year
          )}
        </Typography>
      </Box>

      <Legend
        min={domain[0]}
        mid={domain[1]}
        max={domain[2]}
        label={metric === "co2" ? "Total CO₂ (Mt)" : "CO₂ per capita (t)"}
      />
    </Box>
  );
}

function fmtVal(v, unit, year) {
  if (!Number.isFinite(v)) return "—";
  const n = unit === "Mt" ? Math.round(v).toLocaleString() : v.toFixed(2);
  return `${n} ${unit} (${year})`;
}
