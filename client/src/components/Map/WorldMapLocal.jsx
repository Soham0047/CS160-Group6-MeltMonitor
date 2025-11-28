import { useEffect, useMemo, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Slider,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Grow,
  Chip,
  Stack,
  Autocomplete,
  TextField,
  IconButton,
  Collapse,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";

import { fetchCountriesGeoJSON } from "../../services/mapDataLocal";
import {
  fetchAnnualEmissions,
  fetchPerCapitaEmissions,
  getEmissionsForYear,
  formatEmissions,
} from "../../services/extendedCO2Data";
import Legend from "./Legend";
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
  styles: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e3f2fd" }],
    },
  ],
};

export default function WorldMapLocal() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState(null);
  const [countryNameByIso, setCountryNameByIso] = useState(new Map());
  const [isoByCountryName, setIsoByCountryName] = useState(new Map());
  const [totalDataset, setTotalDataset] = useState(null);
  const [perCapitaDataset, setPerCapitaDataset] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [year, setYear] = useState(null);
  const [metric, setMetric] = useState("total");
  const [hover, setHover] = useState({
    iso: null,
    name: "—",
    total: null,
    perCapita: null,
  });
  const [selected, setSelected] = useState({
    iso: null,
    name: "—",
    total: null,
    perCapita: null,
  });
  const [map, setMap] = useState(null);
  const [dataLayer, setDataLayer] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const normalizeName = useCallback(
    (value) => (value == null ? "" : String(value).trim()),
    []
  );

  // Load data on mount
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Starting data fetch...");
        const [totalData, perCapitaData, geo] = await Promise.all([
          fetchAnnualEmissions(),
          fetchPerCapitaEmissions(),
          fetchCountriesGeoJSON(),
        ]);
        console.log("Data loaded (1949-2024):", {
          totalData,
          perCapitaData,
          geo,
        });

        if (!alive) return;

        setCountries(geo);
        setTotalDataset(totalData);
        setPerCapitaDataset(perCapitaData);

        console.log("Total dataset:", {
          byIso: totalData?.byIso?.size,
          years: totalData?.years?.length,
          countries: totalData?.countryByIso?.size,
        });
        console.log("Per capita dataset:", {
          byIso: perCapitaData?.byIso?.size,
          years: perCapitaData?.years?.length,
          countries: perCapitaData?.countryByIso?.size,
        });
        console.log("GeoJSON features:", geo?.features?.length);

        const yearSet = new Set([
          ...(totalData?.years ?? []),
          ...(perCapitaData?.years ?? []),
        ]);
        const sortedYears = [...yearSet].sort((a, b) => a - b);
        console.log("Available years:", sortedYears.length, sortedYears);
        setAvailableYears(sortedYears);
        setYear((prev) => {
          if (prev != null && sortedYears.includes(prev)) return prev;
          return sortedYears.length
            ? sortedYears[sortedYears.length - 1]
            : null;
        });

        const names = new Map();
        const indexByName = new Map();

        const registerName = (iso, rawName) => {
          const isoCode = normalizeName(iso).toUpperCase();
          const name = normalizeName(rawName);
          if (!isoCode) return;
          if (name) {
            names.set(isoCode, name);
            if (!indexByName.has(name)) {
              indexByName.set(name, isoCode);
            }
          } else if (!names.has(isoCode)) {
            names.set(isoCode, isoCode);
          }
        };

        totalData?.countryByIso?.forEach((name, iso) =>
          registerName(iso, name)
        );
        perCapitaData?.countryByIso?.forEach((name, iso) =>
          registerName(iso, name)
        );

        geo?.features?.forEach((feature) => {
          const props = feature.properties || {};
          const iso = normalizeName(
            props.ISO3 ||
              props.ISO_A3 ||
              props.ISO_A3_EH ||
              props["ISO3166-1-Alpha-3"]
          ).toUpperCase();
          const displayName = normalizeName(
            props.COUNTRY || props.ADMIN || props.name
          );
          if (iso) {
            registerName(iso, displayName || iso);
          }
        });

        setCountryNameByIso(names);
        setIsoByCountryName(indexByName);
      } catch (err) {
        console.error("Error loading data:", err);
        if (alive) {
          setError(err.message || "Failed to load data");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [normalizeName]);

  const totalYearValues = useMemo(() => {
    if (!year || !totalDataset?.byIso) return new Map();
    return getEmissionsForYear(totalDataset.byIso, year);
  }, [totalDataset, year]);

  const perCapitaYearValues = useMemo(() => {
    if (!year || !perCapitaDataset?.byIso) return new Map();
    return getEmissionsForYear(perCapitaDataset.byIso, year);
  }, [perCapitaDataset, year]);

  const yearEmissions = useMemo(() => {
    return metric === "total" ? totalYearValues : perCapitaYearValues;
  }, [metric, totalYearValues, perCapitaYearValues]);

  const domain = useMemo(() => {
    if (yearEmissions.size === 0) return [0, 1, 2];
    const values = Array.from(yearEmissions.values()).filter(
      (v) => Number.isFinite(v) && v > 0
    );
    if (!values.length) return [0, 1, 2];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mid = min + (max - min) / 2;
    return [min, mid, max];
  }, [yearEmissions]);

  const resolveIsoFromFeature = useCallback(
    (feature) => {
      if (!feature) return null;
      const props = feature.getProperty
        ? {
            ISO3: feature.getProperty("ISO3"),
            ISO_A3: feature.getProperty("ISO_A3"),
            ISO_A3_EH: feature.getProperty("ISO_A3_EH"),
            "ISO3166-1-Alpha-3": feature.getProperty("ISO3166-1-Alpha-3"),
            COUNTRY: feature.getProperty("COUNTRY"),
            ADMIN: feature.getProperty("ADMIN"),
            name: feature.getProperty("name"),
          }
        : feature.properties || {};

      // Try to get ISO3 code from properties
      const isoFromProps = normalizeName(
        props.ISO3 ||
          props.ISO_A3 ||
          props.ISO_A3_EH ||
          props["ISO3166-1-Alpha-3"]
      ).toUpperCase();

      // If we have a valid ISO3 code (not -99 or empty), use it
      if (isoFromProps && isoFromProps !== "-99" && isoFromProps !== "99") {
        return isoFromProps;
      }

      // Fall back to name lookup
      const name = normalizeName(props.COUNTRY || props.ADMIN || props.name);
      if (!name) return null;

      return isoByCountryName.get(name) || null;
    },
    [isoByCountryName, normalizeName]
  );

  const getDisplayNameForIso = useCallback(
    (iso3, fallback = "Unknown") => {
      if (!iso3) return fallback;
      return countryNameByIso.get(iso3) || fallback || iso3;
    },
    [countryNameByIso]
  );

  const getFeatureStyle = useCallback(
    (feature) => {
      const iso3 = resolveIsoFromFeature(feature);
      const value = iso3 ? yearEmissions.get(iso3) : null;
      const t = scaleLinear(domain[0], domain[2], value);
      const fill =
        value == null ? "rgba(200,200,200,0.3)" : rampRdYlGnReversed(t);
      return {
        fillColor: fill,
        fillOpacity: 0.85,
        strokeColor: "rgba(70,70,70,0.4)",
        strokeWeight: 0.6,
      };
    },
    [yearEmissions, domain, resolveIsoFromFeature]
  );

  useEffect(() => {
    if (!map || !countries) return undefined;

    const layer = new window.google.maps.Data({ map });
    layer.addGeoJson(countries);
    layer.setStyle((feature) => getFeatureStyle(feature));
    setDataLayer(layer);

    const handleMouseOver = (event) => {
      const feature = event.feature;
      const iso3 = resolveIsoFromFeature(feature);
      const fallbackName =
        normalizeName(
          feature.getProperty("COUNTRY") ||
            feature.getProperty("ADMIN") ||
            feature.getProperty("name")
        ) || "Unknown";

      const total = iso3 ? (totalYearValues.get(iso3) ?? null) : null;
      const perCapita = iso3 ? (perCapitaYearValues.get(iso3) ?? null) : null;

      setHover({
        iso: iso3,
        name: getDisplayNameForIso(iso3, fallbackName),
        total,
        perCapita,
      });

      layer.overrideStyle(feature, {
        fillColor: "#FFD700",
        fillOpacity: 0.95,
        strokeColor: "#FF6B00",
        strokeWeight: 2,
      });
    };

    const handleMouseOut = (event) => {
      layer.revertStyle(event.feature);
      setHover({ iso: null, name: "—", total: null, perCapita: null });
    };

    const handleClick = (event) => {
      const feature = event.feature;
      const iso3 = resolveIsoFromFeature(feature);
      const fallbackName =
        normalizeName(
          feature.getProperty("COUNTRY") ||
            feature.getProperty("ADMIN") ||
            feature.getProperty("name")
        ) || "Unknown";

      const total = iso3 ? (totalYearValues.get(iso3) ?? null) : null;
      const perCapita = iso3 ? (perCapitaYearValues.get(iso3) ?? null) : null;

      setSelected({
        iso: iso3,
        name: getDisplayNameForIso(iso3, fallbackName),
        total,
        perCapita,
      });
    };

    layer.addListener("mouseover", handleMouseOver);
    layer.addListener("mouseout", handleMouseOut);
    layer.addListener("click", handleClick);

    return () => {
      layer.setMap(null);
      window.google.maps.event.clearInstanceListeners(layer);
    };
  }, [
    map,
    countries,
    totalYearValues,
    perCapitaYearValues,
    resolveIsoFromFeature,
    getDisplayNameForIso,
    normalizeName,
    getFeatureStyle,
  ]);

  useEffect(() => {
    if (!dataLayer) return;
    dataLayer.setStyle((feature) => getFeatureStyle(feature));
  }, [dataLayer, getFeatureStyle]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const findNearestYear = useCallback(
    (target) => {
      if (!availableYears.length || target == null) return null;
      let closest = availableYears[0];
      let minDiff = Math.abs(closest - target);
      for (const y of availableYears) {
        const diff = Math.abs(y - target);
        if (diff < minDiff) {
          minDiff = diff;
          closest = y;
        }
      }
      return closest;
    },
    [availableYears]
  );

  // Handle year change
  const handleYearChange = useCallback(
    (event, newValue) => {
      const raw = Array.isArray(newValue) ? newValue[0] : newValue;
      const closest = findNearestYear(raw);
      if (closest != null) {
        setYear((prev) => (prev === closest ? prev : closest));
      }
    },
    [findNearestYear]
  );

  const handleMetricChange = useCallback((event, nextMetric) => {
    if (nextMetric) {
      setMetric(nextMetric);
    }
  }, []);

  const countryOptions = useMemo(() => {
    if (!countryNameByIso || countryNameByIso.size === 0) return [];

    const options = Array.from(countryNameByIso.entries())
      .map(([iso, name]) => ({
        label: name,
        iso: iso,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return options;
  }, [countryNameByIso]);

  const handleSearchChange = useCallback(
    (event, newValue) => {
      setSearchValue(newValue);

      if (newValue && newValue.iso) {
        const iso = newValue.iso;
        const name = newValue.label;
        const total = totalYearValues.get(iso) ?? null;
        const perCapita = perCapitaYearValues.get(iso) ?? null;

        setSelected({
          iso,
          name,
          total,
          perCapita,
        });
      }
    },
    [totalYearValues, perCapitaYearValues]
  );

  const sliderMarks = useMemo(() => {
    if (!availableYears.length) return [];
    const len = availableYears.length;
    if (len <= 6) {
      return availableYears.map((value) => ({ value, label: `${value}` }));
    }
    const indices = new Set([
      0,
      Math.floor(len / 3),
      Math.floor((2 * len) / 3),
      len - 1,
    ]);
    const marks = Array.from(indices)
      .sort((a, b) => a - b)
      .map((idx) => {
        const value = availableYears[idx];
        return { value, label: `'${String(value).slice(-2)}` };
      });
    return marks;
  }, [availableYears]);

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

  if (
    !isLoaded ||
    loading ||
    !countries ||
    !totalDataset ||
    !perCapitaDataset ||
    availableYears.length === 0
  ) {
    return (
      <Box
        sx={{
          height: "clamp(520px, 70vh, 800px)",
          display: "grid",
          placeItems: "center",
          p: 3,
        }}
      >
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {!isLoaded
                ? "Loading Google Maps..."
                : "Loading emissions data..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments...
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "clamp(520px, 70vh, 800px)",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />

      {/* Metric Toggle */}
      <Fade in timeout={800}>
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            borderRadius: "50px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 0.75,
          }}
        >
          <ToggleButtonGroup
            value={metric}
            exclusive
            onChange={handleMetricChange}
            sx={{
              gap: 0.5,
              "& .MuiToggleButton-root": {
                color: "white",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                border: "none",
                borderRadius: "40px !important",
                textTransform: "none",
                fontSize: "0.95rem",
                minWidth: "160px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
                "&.Mui-selected": {
                  backgroundColor: "white",
                  color: "#667eea",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: "white",
                  },
                },
              },
            }}
          >
            <ToggleButton value="total">
              <PublicIcon sx={{ mr: 1, fontSize: 20 }} />
              Total Emissions
            </ToggleButton>
            <ToggleButton value="perCapita">
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              Per Capita
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Fade>

      {/* Country Search */}
      <Fade in timeout={800}>
        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            left: 320,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Search Icon Button */}
          <Paper
            elevation={searchExpanded ? 0 : 6}
            sx={{
              borderRadius: "50%",
              width: searchExpanded ? 0 : 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: searchExpanded
                ? "transparent"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              opacity: searchExpanded ? 0 : 1,
              transform: searchExpanded ? "scale(0)" : "scale(1)",
            }}
          >
            <IconButton
              onClick={() => setSearchExpanded(true)}
              sx={{
                color: "white",
                width: 40,
                height: 40,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  transform: "scale(1.1)",
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Paper>

          {/* Expanded Search Bar */}
          <Collapse
            in={searchExpanded}
            orientation="horizontal"
            timeout={400}
            sx={{
              "& .MuiCollapse-wrapper": {
                width: searchExpanded ? "280px" : "0px",
              },
            }}
          >
            <Paper
              elevation={6}
              sx={{
                borderRadius: 3,
                p: 1.5,
                width: 280,
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Autocomplete
                value={searchValue}
                onChange={handleSearchChange}
                options={countryOptions}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(option, value) =>
                  option.iso === value.iso
                }
                onClose={() => {
                  // Close the search bar after a short delay if nothing is selected
                  setTimeout(() => {
                    if (!searchValue) {
                      setSearchExpanded(false);
                    }
                  }, 200);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search for a country..."
                    variant="outlined"
                    size="small"
                    autoFocus
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <SearchIcon
                          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                        />
                      ),
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearchExpanded(false);
                              setSearchValue(null);
                            }}
                            sx={{
                              ml: 0.5,
                              color: "text.secondary",
                              "&:hover": {
                                color: "#667eea",
                              },
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              ×
                            </Typography>
                          </IconButton>
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "& fieldset": {
                          borderColor: "rgba(102, 126, 234, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(102, 126, 234, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.iso}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "0.7rem" }}
                      >
                        {option.iso}
                      </Typography>
                    </Box>
                  </li>
                )}
                sx={{
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "#667eea",
                  },
                }}
              />
            </Paper>
          </Collapse>
        </Box>
      </Fade>

      {/* Year Display & Slider */}
      <Grow in timeout={1000}>
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            bottom: 24,
            left: 24,
            zIndex: 1000,
            borderRadius: 2,
            p: 1.5,
            width: "280px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: 12,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 1.5 }}
          >
            <TrendingUpIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              {year ?? "—"}
            </Typography>
            <Chip
              label={metric === "total" ? "Total" : "Per Capita"}
              size="small"
              sx={{
                ml: "auto",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            />
          </Stack>
          <Slider
            value={year ?? sliderMarks[sliderMarks.length - 1]?.value ?? 0}
            onChange={handleYearChange}
            min={sliderMarks[0]?.value ?? 0}
            max={sliderMarks[sliderMarks.length - 1]?.value ?? 0}
            step={sliderMarks.length <= 1 ? null : 1}
            marks={sliderMarks}
            disabled={!sliderMarks.length}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val}`}
            sx={{
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
                transition: "all 0.2s ease",
                "&:hover": {
                  width: 16,
                  height: 16,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.6)",
                },
              },
              "& .MuiSlider-track": {
                height: 4,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              },
              "& .MuiSlider-rail": {
                height: 4,
                backgroundColor: "#e0e0e0",
              },
              "& .MuiSlider-mark": {
                backgroundColor: "#bdbdbd",
                height: 6,
                width: 2,
              },
              "& .MuiSlider-markLabel": {
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.secondary",
              },
            }}
          />
        </Paper>
      </Grow>

      {/* Selected Country Panel */}
      <Fade in timeout={600}>
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: 80,
            left: 16,
            zIndex: 1000,
            borderRadius: 3,
            p: 2,
            width: 280,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 12,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            SELECTED COUNTRY
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              mt: 0.5,
              color: selected.name === "—" ? "text.secondary" : "text.primary",
              transition: "color 0.3s ease",
            }}
          >
            {selected.name}
          </Typography>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Total emissions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selected.total != null
                ? formatEmissions(selected.total, false)
                : "No data"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Per capita emissions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selected.perCapita != null
                ? formatEmissions(selected.perCapita, true)
                : "No data"}
            </Typography>
          </Box>
        </Paper>
      </Fade>

      {/* Hover Panel */}
      <Fade in timeout={600}>
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: 80,
            right: 16,
            zIndex: 1000,
            borderRadius: 3,
            p: 2,
            width: 240,
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Hovered country
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1 }}
            color={hover.iso ? "text.primary" : "text.secondary"}
          >
            {hover.name}
          </Typography>
          <Stack spacing={1.2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total emissions
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {hover.total != null
                  ? formatEmissions(hover.total, false)
                  : "No data"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Per capita emissions
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {hover.perCapita != null
                  ? formatEmissions(hover.perCapita, true)
                  : "No data"}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Fade>

      <Legend
        min={domain[0]}
        mid={domain[1]}
        max={domain[2]}
        label={
          metric === "total"
            ? "Total CO₂ (metric tonnes)"
            : "CO₂ per capita (t/person)"
        }
      />
    </Box>
  );
}
