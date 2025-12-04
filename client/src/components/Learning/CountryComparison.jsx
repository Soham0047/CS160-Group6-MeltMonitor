import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Grid,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PublicIcon from "@mui/icons-material/Public";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartIcon from "@mui/icons-material/BarChart";
import { COUNTRIES } from "./HomeCountry";
import { isOpenAIConfigured } from "../../services/openaiService";

// Sample emission data (would come from API in real app)
const SAMPLE_DATA = {
  USA: { co2: 5000, co2_per_capita: 15.2, population: 331000000, trend: -2.5 },
  CHN: { co2: 10500, co2_per_capita: 7.4, population: 1400000000, trend: 1.2 },
  IND: { co2: 2700, co2_per_capita: 1.9, population: 1380000000, trend: 4.5 },
  RUS: { co2: 1700, co2_per_capita: 11.8, population: 144000000, trend: -1.8 },
  JPN: { co2: 1100, co2_per_capita: 8.7, population: 126000000, trend: -3.2 },
  DEU: { co2: 700, co2_per_capita: 8.4, population: 83000000, trend: -4.1 },
  GBR: { co2: 350, co2_per_capita: 5.2, population: 67000000, trend: -5.5 },
  FRA: { co2: 300, co2_per_capita: 4.5, population: 67000000, trend: -2.8 },
  BRA: { co2: 450, co2_per_capita: 2.1, population: 212000000, trend: 0.5 },
  CAN: { co2: 550, co2_per_capita: 14.5, population: 38000000, trend: -1.2 },
  AUS: { co2: 400, co2_per_capita: 15.8, population: 25000000, trend: -2.1 },
  KOR: { co2: 600, co2_per_capita: 11.6, population: 52000000, trend: 1.5 },
  MEX: { co2: 450, co2_per_capita: 3.5, population: 128000000, trend: 0.8 },
  IDN: { co2: 600, co2_per_capita: 2.2, population: 273000000, trend: 3.2 },
  SAU: { co2: 600, co2_per_capita: 17.2, population: 35000000, trend: 1.8 },
  ZAF: { co2: 450, co2_per_capita: 7.5, population: 60000000, trend: -0.5 },
  TUR: { co2: 400, co2_per_capita: 4.8, population: 84000000, trend: 2.1 },
  POL: { co2: 300, co2_per_capita: 7.9, population: 38000000, trend: -1.5 },
  ITA: { co2: 320, co2_per_capita: 5.3, population: 60000000, trend: -3.8 },
  ESP: { co2: 250, co2_per_capita: 5.3, population: 47000000, trend: -4.2 },
};

// World average for comparison
const WORLD_AVERAGE = {
  co2_per_capita: 4.5,
  trend: 0.5,
};

/**
 * CountryCard - Display a country's stats in comparison view
 */
function CountryCard({ country, data, onRemove, isFirst }) {
  const countryInfo = COUNTRIES.find((c) => c.iso3 === country);
  const countryData = data || SAMPLE_DATA[country] || null;

  if (!countryData) {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "rgba(0,0,0,0.02)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data available for {countryInfo?.name || country}
        </Typography>
      </Paper>
    );
  }

  const formatCO2 = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)} Gt`;
    return `${value.toFixed(0)} Mt`;
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: isFirst ? "2px solid #667eea" : "1px solid #e0e0e0",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      {onRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {countryInfo?.name || country}
        </Typography>
        <Chip label={country} size="small" variant="outlined" />
      </Box>

      <Stack spacing={2}>
        {/* Total CO2 */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total CO₂ Emissions
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {formatCO2(countryData.co2)}
          </Typography>
        </Box>

        {/* Per Capita */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Per Capita
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {countryData.co2_per_capita.toFixed(1)} t/person
            </Typography>
            <Chip
              size="small"
              label={
                countryData.co2_per_capita > WORLD_AVERAGE.co2_per_capita
                  ? `${((countryData.co2_per_capita / WORLD_AVERAGE.co2_per_capita - 1) * 100).toFixed(0)}% above avg`
                  : `${((1 - countryData.co2_per_capita / WORLD_AVERAGE.co2_per_capita) * 100).toFixed(0)}% below avg`
              }
              color={
                countryData.co2_per_capita > WORLD_AVERAGE.co2_per_capita
                  ? "warning"
                  : "success"
              }
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (countryData.co2_per_capita / 20) * 100)}
            sx={{
              mt: 0.5,
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                bgcolor:
                  countryData.co2_per_capita > WORLD_AVERAGE.co2_per_capita
                    ? "#ff9800"
                    : "#4caf50",
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Trend */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            5-Year Trend
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {countryData.trend < 0 ? (
              <TrendingDownIcon sx={{ color: "#4caf50" }} />
            ) : (
              <TrendingUpIcon sx={{ color: "#ff9800" }} />
            )}
            <Typography
              variant="h6"
              fontWeight={600}
              color={countryData.trend < 0 ? "#4caf50" : "#ff9800"}
            >
              {countryData.trend > 0 ? "+" : ""}
              {countryData.trend.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              per year
            </Typography>
          </Box>
        </Box>

        {/* Population Context */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Population
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {(countryData.population / 1e6).toFixed(1)}M
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

/**
 * CountryComparison - Side-by-side country comparison
 */
export function CountryComparison({ emissionsData }) {
  const [selectedCountries, setSelectedCountries] = useState(["USA", "CHN"]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const maxCountries = 4;

  // Helper to get country data from array
  const getCountryData = (iso3) => {
    if (!emissionsData || !Array.isArray(emissionsData)) {
      return SAMPLE_DATA[iso3] || null;
    }
    // Get all records for this country with valid CO2 data
    const countryRecords = emissionsData.filter(
      (d) => d.iso_code === iso3 && d.co2 > 0
    );
    if (countryRecords.length === 0) {
      return SAMPLE_DATA[iso3] || null;
    }

    // Get latest record
    const latest = countryRecords.reduce((a, b) => (a.year > b.year ? a : b));

    // Calculate 5-year trend
    let trend = 0;
    const fiveYearsAgo = latest.year - 5;
    const oldRecord = countryRecords.find((d) => d.year === fiveYearsAgo);

    if (oldRecord && oldRecord.co2 > 0 && latest.co2 > 0) {
      // Calculate compound annual growth rate (CAGR)
      const growthFactor = latest.co2 / oldRecord.co2;
      trend = (Math.pow(growthFactor, 1 / 5) - 1) * 100; // Convert to percentage per year
    } else {
      // Fallback: try to find any record from 3-7 years ago
      const nearbyRecords = countryRecords.filter(
        (d) => d.year >= latest.year - 7 && d.year <= latest.year - 3
      );
      if (nearbyRecords.length > 0) {
        const oldestNearby = nearbyRecords.reduce((a, b) =>
          a.year < b.year ? a : b
        );
        const yearDiff = latest.year - oldestNearby.year;
        if (yearDiff > 0 && oldestNearby.co2 > 0) {
          const growthFactor = latest.co2 / oldestNearby.co2;
          trend = (Math.pow(growthFactor, 1 / yearDiff) - 1) * 100;
        }
      }
    }

    return {
      co2: latest.co2,
      co2_per_capita: latest.co2_per_capita,
      population:
        latest.co2 && latest.co2_per_capita
          ? Math.round((latest.co2 * 1e6) / latest.co2_per_capita)
          : 0,
      trend: trend,
    };
  };

  const addCountry = (country) => {
    if (
      country &&
      selectedCountries.length < maxCountries &&
      !selectedCountries.includes(country.iso3)
    ) {
      setSelectedCountries([...selectedCountries, country.iso3]);
      setAddDialogOpen(false);
      setAiSummary(null); // Reset AI summary when countries change
    }
  };

  const removeCountry = (iso3) => {
    if (selectedCountries.length > 1) {
      setSelectedCountries(selectedCountries.filter((c) => c !== iso3));
      setAiSummary(null); // Reset AI summary when countries change
    }
  };

  const availableCountries = COUNTRIES.filter(
    (c) => !selectedCountries.includes(c.iso3)
  );

  // Generate AI comparison
  const generateAIComparison = async () => {
    if (!isOpenAIConfigured()) {
      setAiError("OpenAI API not configured");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const { generateCountryComparison } =
        await import("../../services/openaiService");

      const countriesData = selectedCountries.map((iso3) => {
        const data = getCountryData(iso3) || SAMPLE_DATA[iso3];
        const countryInfo = COUNTRIES.find((c) => c.iso3 === iso3);
        return {
          name: countryInfo?.name || iso3,
          iso3,
          co2: data?.co2 || 0,
          co2_per_capita: data?.co2_per_capita || 0,
          population: data?.population || 0,
          trend: data?.trend || 0,
        };
      });

      const summary = await generateCountryComparison(countriesData);
      setAiSummary(summary);
    } catch (err) {
      console.error("Failed to generate AI comparison:", err);
      setAiError("Failed to generate comparison. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CompareArrowsIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Compare Countries
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Side-by-side emissions comparison
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {selectedCountries.map((iso3, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={iso3}>
            <CountryCard
              country={iso3}
              data={getCountryData(iso3)}
              onRemove={
                selectedCountries.length > 1
                  ? () => removeCountry(iso3)
                  : undefined
              }
              isFirst={index === 0}
            />
          </Grid>
        ))}

        {selectedCountries.length < maxCountries && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              onClick={() => setAddDialogOpen(true)}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "2px dashed #e0e0e0",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  borderColor: "#667eea",
                  bgcolor: "rgba(102,126,234,0.05)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: "50%",
                  bgcolor: "rgba(102,126,234,0.1)",
                  mb: 2,
                }}
              >
                <AddIcon sx={{ fontSize: 40, color: "#667eea" }} />
              </Box>
              <Typography
                variant="body1"
                fontWeight={600}
                color="text.secondary"
              >
                Add another country
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({maxCountries - selectedCountries.length} slots remaining)
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add Country Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PublicIcon />
            Add Country to Compare
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a country to add to your comparison (up to {maxCountries}{" "}
            countries)
          </Typography>
          <Autocomplete
            options={availableCountries}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => addCountry(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search countries"
                placeholder="Type to search..."
                autoFocus
              />
            )}
            renderOption={(props, option) => {
              const { key, ...restProps } = props;
              return (
                <Box key={key} component="li" {...restProps}>
                  <PublicIcon
                    sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                  />
                  {option.name}
                  <Chip
                    label={option.iso3}
                    size="small"
                    sx={{ ml: "auto", fontSize: 10 }}
                  />
                </Box>
              );
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* AI-Powered Comparison Summary */}
      {selectedCountries.length >= 2 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />

          {/* Generate AI Summary Button */}
          {!aiSummary && !aiLoading && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={generateAIComparison}
                disabled={!isOpenAIConfigured()}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Generate AI Comparison Analysis
              </Button>
              {!isOpenAIConfigured() && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Configure OpenAI API key to enable AI analysis
                </Typography>
              )}
            </Box>
          )}

          {/* Loading State */}
          {aiLoading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#667eea", mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Analyzing country data with AI...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {aiError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {aiError}
            </Alert>
          )}

          {/* AI Summary Results */}
          {aiSummary && !aiLoading && (
            <AIComparisonSummary
              summary={aiSummary}
              countries={selectedCountries}
              onRefresh={generateAIComparison}
            />
          )}
        </Box>
      )}
    </Paper>
  );
}

/**
 * AI Comparison Summary Component
 */
function AIComparisonSummary({ summary, countries, onRefresh }) {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)",
        border: "1px solid rgba(102,126,234,0.2)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#667eea" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#667eea" }}>
            AI Analysis
          </Typography>
        </Box>
        <Tooltip title="Generate new analysis">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary */}
      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
        {summary.summary}
      </Typography>

      {/* Key Findings */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <BarChartIcon fontSize="small" />
          Key Findings
        </Typography>
        <Stack spacing={1}>
          {summary.keyFindings?.map((finding, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 1.5,
                bgcolor: "white",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Chip
                label={idx + 1}
                size="small"
                sx={{
                  minWidth: 24,
                  height: 24,
                  bgcolor: "#667eea",
                  color: "white",
                  fontWeight: 700,
                }}
              />
              <Typography variant="body2">{finding}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Country Insights */}
      {summary.countryInsights && summary.countryInsights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Country Insights
          </Typography>
          <Grid container spacing={2}>
            {summary.countryInsights.map((insight, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: `4px solid ${
                      insight.highlight === "positive"
                        ? "#4caf50"
                        : insight.highlight === "negative"
                          ? "#ff9800"
                          : "#667eea"
                    }`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {insight.country}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insight.insight}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Context */}
      {summary.context && (
        <Box
          sx={{
            p: 2,
            bgcolor: "rgba(102,126,234,0.1)",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            📊 {summary.context}
          </Typography>
        </Box>
      )}

      {/* Recommendation */}
      {summary.recommendation && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3e0",
            borderRadius: 2,
            border: "1px solid #ffcc80",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            💡 Takeaway: {summary.recommendation}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

/**
 * Generate comparison insights
 */
function ComparisonInsights({ countries }) {
  const insights = useMemo(() => {
    const data = countries
      .map((iso3) => ({ iso3, ...SAMPLE_DATA[iso3] }))
      .filter((d) => d.co2);

    if (data.length < 2) return [];

    const sorted = {
      byTotal: [...data].sort((a, b) => b.co2 - a.co2),
      byPerCapita: [...data].sort(
        (a, b) => b.co2_per_capita - a.co2_per_capita
      ),
      byTrend: [...data].sort((a, b) => a.trend - b.trend),
    };

    const getCountryName = (iso3) =>
      COUNTRIES.find((c) => c.iso3 === iso3)?.name || iso3;

    const insights = [];

    // Highest emitter
    insights.push(
      `${getCountryName(sorted.byTotal[0].iso3)} has the highest total emissions (${(sorted.byTotal[0].co2 / 1000).toFixed(1)} Gt)`
    );

    // Per capita comparison
    if (
      sorted.byPerCapita[0].co2_per_capita >
      sorted.byPerCapita[sorted.byPerCapita.length - 1].co2_per_capita * 2
    ) {
      insights.push(
        `${getCountryName(sorted.byPerCapita[0].iso3)}'s per-capita emissions are ${(sorted.byPerCapita[0].co2_per_capita / sorted.byPerCapita[sorted.byPerCapita.length - 1].co2_per_capita).toFixed(1)}× higher than ${getCountryName(sorted.byPerCapita[sorted.byPerCapita.length - 1].iso3)}`
      );
    }

    // Best trend
    if (sorted.byTrend[0].trend < 0) {
      insights.push(
        `${getCountryName(sorted.byTrend[0].iso3)} is reducing emissions fastest (${sorted.byTrend[0].trend.toFixed(1)}% per year)`
      );
    }

    return insights;
  }, [countries]);

  return (
    <Stack spacing={0.5}>
      {insights.map((insight, idx) => (
        <Typography key={idx} variant="body2">
          • {insight}
        </Typography>
      ))}
    </Stack>
  );
}

/**
 * QuickCompareWidget - Compact comparison for map sidebar
 */
export function QuickCompareWidget({ currentCountry, emissionsData }) {
  const [compareWith, setCompareWith] = useState(null);

  // Helper to get country data from array
  const getCountryData = (iso3) => {
    if (!emissionsData || !Array.isArray(emissionsData)) {
      return SAMPLE_DATA[iso3] || null;
    }
    const countryRecords = emissionsData.filter(
      (d) => d.iso_code === iso3 && d.co2 > 0
    );
    if (countryRecords.length === 0) {
      return SAMPLE_DATA[iso3] || null;
    }
    const latest = countryRecords.reduce((a, b) => (a.year > b.year ? a : b));

    // Calculate 5-year trend
    let trend = 0;
    const fiveYearsAgo = latest.year - 5;
    const oldRecord = countryRecords.find((d) => d.year === fiveYearsAgo);

    if (oldRecord && oldRecord.co2 > 0 && latest.co2 > 0) {
      const growthFactor = latest.co2 / oldRecord.co2;
      trend = (Math.pow(growthFactor, 1 / 5) - 1) * 100;
    }

    return {
      co2: latest.co2,
      co2_per_capita: latest.co2_per_capita,
      trend: trend,
    };
  };

  if (!currentCountry) return null;

  const currentData = getCountryData(currentCountry);
  const compareData = compareWith ? getCountryData(compareWith) : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Quick Compare
      </Typography>
      <Autocomplete
        size="small"
        options={COUNTRIES.filter((c) => c.iso3 !== currentCountry)}
        getOptionLabel={(option) => option.name}
        onChange={(_, value) => setCompareWith(value?.iso3 || null)}
        renderInput={(params) => (
          <TextField {...params} placeholder="Compare with..." />
        )}
        sx={{ mb: 1 }}
      />

      {compareWith && currentData && compareData && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                {COUNTRIES.find((c) => c.iso3 === currentCountry)?.name}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {currentData.co2_per_capita?.toFixed(1) || "N/A"} t/person
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">
                {COUNTRIES.find((c) => c.iso3 === compareWith)?.name}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {compareData.co2_per_capita?.toFixed(1) || "N/A"} t/person
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default CountryComparison;
