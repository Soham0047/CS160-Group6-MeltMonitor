import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Autocomplete,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SaveIcon from "@mui/icons-material/Save";
import CloudIcon from "@mui/icons-material/Cloud";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MapIcon from "@mui/icons-material/Map";
import {
  getHomeCountry as getLocalHomeCountry,
  setHomeCountry as setLocalHomeCountry,
} from "../../services/localStorage";
import * as api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

// Common countries list with ISO3 codes
const COUNTRIES = [
  { iso3: "USA", name: "United States" },
  { iso3: "CHN", name: "China" },
  { iso3: "IND", name: "India" },
  { iso3: "RUS", name: "Russia" },
  { iso3: "JPN", name: "Japan" },
  { iso3: "DEU", name: "Germany" },
  { iso3: "GBR", name: "United Kingdom" },
  { iso3: "FRA", name: "France" },
  { iso3: "BRA", name: "Brazil" },
  { iso3: "ITA", name: "Italy" },
  { iso3: "CAN", name: "Canada" },
  { iso3: "KOR", name: "South Korea" },
  { iso3: "AUS", name: "Australia" },
  { iso3: "ESP", name: "Spain" },
  { iso3: "MEX", name: "Mexico" },
  { iso3: "IDN", name: "Indonesia" },
  { iso3: "NLD", name: "Netherlands" },
  { iso3: "SAU", name: "Saudi Arabia" },
  { iso3: "TUR", name: "Turkey" },
  { iso3: "CHE", name: "Switzerland" },
  { iso3: "POL", name: "Poland" },
  { iso3: "SWE", name: "Sweden" },
  { iso3: "BEL", name: "Belgium" },
  { iso3: "ARG", name: "Argentina" },
  { iso3: "NOR", name: "Norway" },
  { iso3: "AUT", name: "Austria" },
  { iso3: "IRN", name: "Iran" },
  { iso3: "ARE", name: "United Arab Emirates" },
  { iso3: "THA", name: "Thailand" },
  { iso3: "ISR", name: "Israel" },
  { iso3: "ZAF", name: "South Africa" },
  { iso3: "SGP", name: "Singapore" },
  { iso3: "MYS", name: "Malaysia" },
  { iso3: "PHL", name: "Philippines" },
  { iso3: "DNK", name: "Denmark" },
  { iso3: "FIN", name: "Finland" },
  { iso3: "CHL", name: "Chile" },
  { iso3: "IRL", name: "Ireland" },
  { iso3: "COL", name: "Colombia" },
  { iso3: "PAK", name: "Pakistan" },
  { iso3: "EGY", name: "Egypt" },
  { iso3: "VNM", name: "Vietnam" },
  { iso3: "BGD", name: "Bangladesh" },
  { iso3: "NGA", name: "Nigeria" },
  { iso3: "PRT", name: "Portugal" },
  { iso3: "CZE", name: "Czech Republic" },
  { iso3: "GRC", name: "Greece" },
  { iso3: "NZL", name: "New Zealand" },
  { iso3: "HUN", name: "Hungary" },
  { iso3: "UKR", name: "Ukraine" },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * HomeCountrySelector - Settings component to pick home country
 */
export function HomeCountrySelector({ onSave }) {
  const { isAuthenticated } = useAuth();
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeCountry = async () => {
      setLoading(true);
      let home = null;

      if (isAuthenticated) {
        try {
          const prefs = await api.getPreferences();
          if (prefs?.homeCountry) {
            home = prefs.homeCountry;
          }
        } catch (e) {
          console.debug("Using local home country:", e);
          home = getLocalHomeCountry();
        }
      } else {
        home = getLocalHomeCountry();
      }

      if (home) {
        const country = COUNTRIES.find((c) => c.iso3 === home.iso3);
        setSelected(country || null);
      }
      setLoading(false);
    };
    fetchHomeCountry();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    const countryData = {
      iso3: selected.iso3,
      name: selected.name,
    };

    // Save locally first
    setLocalHomeCountry(countryData);

    // If authenticated, also save to backend
    if (isAuthenticated) {
      try {
        await api.setHomeCountry(selected.iso3, selected.name);
      } catch (e) {
        console.debug("Failed to save to backend:", e);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (onSave) onSave(selected);
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  // Get the currently saved country fact
  const countryFact = selected
    ? COUNTRY_CLIMATE_FACTS[selected.iso3] || DEFAULT_FACT
    : null;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HomeIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1a1a2e" }}>
            Home Country
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalize your climate experience
          </Typography>
        </Box>
      </Box>

      {/* Country Selector */}
      <Autocomplete
        options={COUNTRIES}
        getOptionLabel={(option) => option.name}
        value={selected}
        onChange={(_, newValue) => setSelected(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for your country..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "rgba(102, 126, 234, 0.04)",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <Box
              key={key}
              component="li"
              {...restProps}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
              }}
            >
              <Typography fontWeight={500}>{option.name}</Typography>
              <Chip
                label={option.iso3}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: "rgba(102, 126, 234, 0.1)",
                  color: "#667eea",
                }}
              />
            </Box>
          );
        }}
        sx={{ mb: 2 }}
      />

      {/* Climate Fact Preview (when country selected) */}
      {selected && countryFact && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(102, 126, 234, 0.08)",
            border: "1px solid rgba(102, 126, 234, 0.15)",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <LightbulbIcon sx={{ color: "#f59e0b", fontSize: 20, mt: 0.25 }} />
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="#667eea"
                sx={{ display: "block", mb: 0.5 }}
              >
                Climate Fact: {selected.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.6, color: "#444" }}
              >
                {countryFact}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Save Button */}
      <Button
        variant="contained"
        fullWidth
        startIcon={
          saving ? (
            <CircularProgress size={16} sx={{ color: "white" }} />
          ) : (
            <SaveIcon />
          )
        }
        onClick={handleSave}
        disabled={!selected || saving}
        sx={{
          py: 1.5,
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.95rem",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
          },
          "&:disabled": {
            background: "rgba(0,0,0,0.12)",
            boxShadow: "none",
          },
        }}
      >
        {saving ? "Saving..." : "Save Preference"}
      </Button>

      {/* Success Alert */}
      {saved && (
        <Alert
          severity="success"
          sx={{
            mt: 2,
            borderRadius: 2,
            "& .MuiAlert-icon": { color: "#10b981" },
          }}
        >
          Home country saved!
          {isAuthenticated && " Synced to your account."}
        </Alert>
      )}

      {/* Sync Status */}
      {isAuthenticated && !saved && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CloudIcon sx={{ fontSize: 18, color: "#667eea" }} />
          <Typography variant="caption" color="text.secondary">
            Your preference syncs across devices
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Country climate facts - curated interesting facts for each country
 */
const COUNTRY_CLIMATE_FACTS = {
  USA: "The U.S. reduced power sector emissions by 40% since 2005, largely due to the coal-to-gas shift and renewable energy growth.",
  CHN: "China installed more solar capacity in 2023 than the entire world did in 2022, leading global clean energy expansion.",
  IND: "India aims to reach 500 GW of renewable energy capacity by 2030, currently the world's fastest-growing major economy.",
  RUS: "Russia holds the world's largest forest area, absorbing about 500 million tonnes of CO₂ annually.",
  JPN: "Japan plans to restart nuclear reactors to meet its 2050 carbon neutrality goal after the 2011 Fukushima disaster.",
  DEU: "Germany's Energiewende policy aims for 80% renewable electricity by 2030, up from 46% in 2023.",
  GBR: "The UK went coal-free for electricity generation for record periods in 2023, a first since the Industrial Revolution.",
  FRA: "France generates about 70% of its electricity from nuclear power, giving it one of the lowest carbon grids in Europe.",
  BRA: "Brazil's Amazon rainforest produces about 20% of the world's oxygen and is crucial for global climate regulation.",
  ITA: "Italy leads Europe in geothermal energy production and has committed to phasing out coal by 2025.",
  CAN: "Canada has the third-largest proven oil reserves but also has 82% of its electricity from non-emitting sources.",
  KOR: "South Korea announced a $95 billion Green New Deal to achieve carbon neutrality by 2050.",
  AUS: "Australia has the highest solar radiation per square meter of any continent, making it ideal for solar energy.",
  ESP: "Spain became the first country where wind power was the top electricity source for an entire year in 2023.",
  MEX: "Mexico has committed to generating 35% of its energy from clean sources by 2024.",
  IDN: "Indonesia is home to the world's third-largest rainforest, crucial for global carbon absorption.",
  NLD: "The Netherlands plans to reduce emissions by 55% by 2030 and leads in offshore wind development.",
  SAU: "Saudi Arabia announced the Middle East Green Initiative to plant 50 billion trees across the region.",
  TUR: "Turkey ratified the Paris Agreement in 2021 and aims for net-zero emissions by 2053.",
  CHE: "Switzerland has one of the lowest per-capita emissions in Europe due to hydropower and efficient transport.",
  POL: "Poland still relies on coal for about 70% of electricity but plans major offshore wind investments.",
  SWE: "Sweden aims to become the world's first fossil-free welfare nation by 2045.",
  NOR: "Norway leads global EV adoption with over 80% of new car sales being electric in 2023.",
  ZAF: "South Africa is transitioning from coal with a $8.5 billion international climate finance deal.",
  SGP: "Singapore plans to deploy 2 GW of solar by 2030 and is exploring regional power grid connections.",
  NZL: "New Zealand generates over 80% of electricity from renewable sources and aims for 100% by 2030.",
};

const DEFAULT_FACT =
  "This country is working on climate initiatives to reduce carbon emissions and transition to cleaner energy sources.";

/**
 * HomeCountryCard - Display card for profile/dashboard
 */
export function HomeCountryCard({ emissionsData, year = 2024 }) {
  const { isAuthenticated } = useAuth();
  const [homeCountry, setHome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeCountry = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const prefs = await api.getPreferences();
          if (prefs?.homeCountry) {
            setHome(prefs.homeCountry);
          } else {
            setHome(getLocalHomeCountry());
          }
        } catch (e) {
          console.debug("Using local home country:", e);
          setHome(getLocalHomeCountry());
        }
      } else {
        setHome(getLocalHomeCountry());
      }
      setLoading(false);
    };
    fetchHomeCountry();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="100%" height={60} sx={{ mt: 2 }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={80}
          sx={{ mt: 2, borderRadius: 2 }}
        />
      </Paper>
    );
  }

  if (!homeCountry) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: "50%",
            bgcolor: "rgba(102, 126, 234, 0.1)",
            display: "inline-flex",
            mb: 2,
          }}
        >
          <HomeIcon sx={{ fontSize: 32, color: "#667eea" }} />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Set Your Home Country
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Go to Settings to personalize your experience with country-specific
          climate insights!
        </Typography>
      </Paper>
    );
  }

  // Get the country fact
  const countryFact = COUNTRY_CLIMATE_FACTS[homeCountry.iso3] || DEFAULT_FACT;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <HomeIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {homeCountry.name}
            </Typography>
            <Chip
              label="Home"
              size="small"
              sx={{
                bgcolor: "#667eea",
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your selected home country
          </Typography>
        </Box>
      </Box>

      {/* Climate Fact */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "rgba(102, 126, 234, 0.08)",
          border: "1px solid rgba(102, 126, 234, 0.15)",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <LightbulbIcon sx={{ color: "#f59e0b", fontSize: 20, mt: 0.25 }} />
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color="#667eea"
              sx={{ display: "block", mb: 0.5 }}
            >
              Climate Fact
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, color: "#444" }}>
              {countryFact}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Button */}
      <Button
        variant="outlined"
        fullWidth
        startIcon={<MapIcon />}
        href="/map"
        sx={{
          borderColor: "#667eea",
          color: "#667eea",
          fontWeight: 600,
          "&:hover": {
            borderColor: "#764ba2",
            bgcolor: "rgba(102, 126, 234, 0.05)",
          },
        }}
      >
        View on Map
      </Button>
    </Paper>
  );
}

export { COUNTRIES, getLocalHomeCountry as getHomeCountry };
