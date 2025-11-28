import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ScienceIcon from "@mui/icons-material/Science";
import { LineChart } from "@mui/x-charts";
import { getGlobalCO2Forecast } from "../../services/globalCO2Forecast";

const HORIZON_OPTIONS = [10, 25];

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)} ppm`;
}

export default function GlobalCO2Forecast() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [horizon, setHorizon] = useState(HORIZON_OPTIONS[0]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log("📊 GlobalCO2Forecast: Starting data fetch...");
        setLoading(true);
        setError(null);
        const result = await getGlobalCO2Forecast(HORIZON_OPTIONS.at(-1));
        console.log("📊 GlobalCO2Forecast: Data fetched successfully", result);
        if (alive) {
          setData(result);
        }
      } catch (err) {
        console.error("📊 GlobalCO2Forecast: Error loading data", err);
        if (alive) {
          setError(err.message || "Unable to load global CO₂ data");
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
  }, []);

  const displayedForecast = useMemo(() => {
    if (!data) return [];
    return data.forecast.slice(0, horizon);
  }, [data, horizon]);

  const recentActuals = useMemo(() => {
    if (!data) return [];
    const { annual } = data;
    const lastYears = Math.min(annual.length, 10);
    return annual.slice(-lastYears);
  }, [data]);

  const chartDataset = useMemo(() => {
    if (!data) return [];
    const base = recentActuals.map((point) => ({
      year: point.year,
      actual: Number(point.ppm.toFixed(2)),
      forecast: null,
    }));
    const future = displayedForecast.map((point) => ({
      year: point.year,
      actual: null,
      forecast: Number(point.ppm.toFixed(2)),
    }));
    return [...base, ...future];
  }, [recentActuals, displayedForecast, data]);

  const lastActual = recentActuals.at(-1);
  const finalForecast = displayedForecast.at(-1);
  const delta =
    finalForecast && lastActual ? finalForecast.ppm - lastActual.ppm : null;

  if (loading) {
    return (
      <Paper
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(255,255,255,0.3)",
          textAlign: "center",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading global CO₂ forecast…</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ mt: 4, p: 4, borderRadius: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!data) return null;

  return (
    <Paper
      sx={{
        mt: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="center"
        mb={3}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScienceIcon sx={{ fontSize: 40 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Global CO₂ Outlook
          </Typography>
          <Typography color="text.secondary">
            Machine learning projection trained on daily atmospheric CO₂ levels
            (2015-2025). Explore the trajectory for the next decade or extend
            the window to 25 years.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={horizon}
          exclusive
          onChange={(_, value) => value && setHorizon(value)}
          sx={{
            background: "rgba(102,126,234,0.12)",
            borderRadius: 999,
            "& .MuiToggleButton-root": {
              border: "none",
              px: 3,
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
            },
          }}
        >
          {HORIZON_OPTIONS.map((option) => (
            <ToggleButton key={option} value={option}>
              {option}-year view
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={4}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 3,
            background: "linear-gradient(135deg, #e0e7ff 0%, #f5e0ff 100%)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <TrendingUpIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Current global average (2025)
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight={800}>
            {formatNumber(lastActual?.ppm)}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 3,
            background: "linear-gradient(135deg, #e0fff4 0%, #daf5ff 100%)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <QueryStatsIcon sx={{ color: "#2e7d32" }} />
            <Typography variant="subtitle2" color="text.secondary">
              Projected {horizon}-year level
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight={800}>
            {formatNumber(finalForecast?.ppm)}
          </Typography>
          <Chip
            label={`+${delta?.toFixed(2) ?? "0.00"} ppm vs 2025`}
            sx={{ mt: 1, fontWeight: 600 }}
            color={delta > 0 ? "warning" : "success"}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 3,
            background: "linear-gradient(135deg, #fff4e6 0%, #ffe0e0 100%)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <ScienceIcon color="warning" />
            <Typography variant="subtitle2" color="text.secondary">
              Model confidence (R²)
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight={800}>
            {(data.regression.r2 * 100).toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Simple linear regression on annualized trend values.
          </Typography>
        </Paper>
      </Stack>

      <Box sx={{ width: "100%", height: 320 }}>
        <LineChart
          dataset={chartDataset}
          xAxis={[{ dataKey: "year", label: "Year" }]}
          series={[
            {
              id: "actual",
              label: "Historical average",
              dataKey: "actual",
              color: "#4c6ef5",
              showMark: false,
            },
            {
              id: "forecast",
              label: "Forecast",
              dataKey: "forecast",
              color: "#ff6b6b",
              showMark: false,
              curve: "linear",
            },
          ]}
          margin={{ left: 50, right: 20, top: 20, bottom: 40 }}
          grid={{ horizontal: true }}
          sx={{
            "& .MuiLineElement-root[data-series-id='forecast']": {
              strokeDasharray: "6 4",
            },
          }}
        />
      </Box>
    </Paper>
  );
}
