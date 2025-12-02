import { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Chip,
  Grid,
  Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScienceIcon from "@mui/icons-material/Science";
import TimelineIcon from "@mui/icons-material/Timeline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { LineChart } from "@mui/x-charts";
import {
  buildCO2PredictionModel,
  formatPredictionValue,
} from "../../services/co2PredictionML";

export default function CO2PredictionPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        console.log("🤖 CO2PredictionPanel: Loading ML model...");
        setLoading(true);
        setError(null);

        const data = await buildCO2PredictionModel();

        if (alive) {
          setModelData(data);
          console.log("✅ CO2PredictionPanel: Model loaded successfully");
        }
      } catch (err) {
        console.error("❌ CO2PredictionPanel: Error", err);
        if (alive) {
          setError(err.message || "Failed to load prediction model");
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

  const chartDataset = useMemo(() => {
    if (!modelData) return [];

    // Take last 15 years of historical data
    const recentHistorical = modelData.historical.slice(-15).map((point) => ({
      year: point.year,
      actual: point.emissions / 1e9, // Convert to Gt
      predicted: null,
    }));

    // Add predictions
    const futurePredictions = modelData.predictions.map((point) => ({
      year: point.year,
      actual: null,
      predicted: point.emissions / 1e9, // Convert to Gt
    }));

    return [...recentHistorical, ...futurePredictions];
  }, [modelData]);

  if (loading) {
    return (
      <Paper
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.95)",
          textAlign: "center",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Training ML model on global emissions data...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Analyzing {modelData?.metrics?.trainingYears || 30} years of recent
          trends (ensemble method)
        </Typography>
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

  if (!modelData) return null;

  const currentYear = modelData.historical[modelData.historical.length - 1];
  const prediction2034 =
    modelData.predictions[modelData.predictions.length - 1];
  const percentageChange =
    ((prediction2034.emissions - currentYear.emissions) /
      currentYear.emissions) *
    100;

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
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="center"
        mb={4}
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
          <PsychologyIcon sx={{ fontSize: 40 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Ensemble ML Forecast
          </Typography>
          <Typography color="text.secondary">
            Multi-algorithm AI prediction combining Linear Regression,
            Polynomial Regression, Exponential Smoothing, and Moving Average
            trained on {modelData.historical.length} years (1949-
            {modelData.metrics.datasetEndYear}). Predictions:{" "}
            {modelData.metrics.predictionStartYear}-
            {modelData.predictions[modelData.predictions.length - 1].year}
          </Typography>
        </Box>
        <Stack spacing={1}>
          <Tooltip title="Ensemble model accuracy on training data">
            <Chip
              icon={<TimelineIcon />}
              label={`R² = ${(modelData.models.ensemble.r2 * 100).toFixed(1)}%`}
              sx={{
                px: 2,
                py: 3,
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            />
          </Tooltip>
          <Tooltip title="Mean Absolute Percentage Error">
            <Chip
              icon={<ScienceIcon />}
              label={`MAPE: ${modelData.models.ensemble.mape.toFixed(2)}%`}
              sx={{
                px: 2,
                py: 3,
                fontSize: "0.9rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #e0e7ff 0%, #f5e0ff 100%)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Current Level ({modelData.metrics.datasetEndYear})
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={800}>
              {formatPredictionValue(currentYear.emissions)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Global fossil fuel CO₂
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #fff4e6 0%, #ffe0e0 100%)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <ScienceIcon color="warning" sx={{ fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Predicted 2034
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={800}>
              {formatPredictionValue(prediction2034.emissions)}
            </Typography>
            <Chip
              label={`${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}% vs ${modelData.metrics.datasetEndYear}`}
              size="small"
              color={percentageChange > 0 ? "error" : "success"}
              sx={{ mt: 1, fontWeight: 600 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #e0fff4 0%, #daf5ff 100%)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <TimelineIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Recent Trend
              </Typography>
            </Stack>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ textTransform: "capitalize" }}
            >
              {modelData.metrics.recentTrend}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Avg growth: {(modelData.metrics.avgGrowthRate * 100).toFixed(2)}%
              per year
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart */}
      <Box sx={{ width: "100%", height: 400, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Historical Data & 10-Year Forecast
        </Typography>
        <LineChart
          dataset={chartDataset}
          xAxis={[
            {
              dataKey: "year",
              label: "Year",
              min: chartDataset[0]?.year,
              max: chartDataset[chartDataset.length - 1]?.year,
            },
          ]}
          yAxis={[
            {
              label: "Global CO₂ Emissions (Gt)",
            },
          ]}
          series={[
            {
              id: "actual",
              label: "Historical (Actual)",
              dataKey: "actual",
              color: "#4c6ef5",
              showMark: false,
              curve: "linear",
            },
            {
              id: "predicted",
              label: "ML Forecast",
              dataKey: "predicted",
              color: "#ff6b6b",
              showMark: false,
              curve: "linear",
            },
          ]}
          margin={{ left: 70, right: 20, top: 20, bottom: 50 }}
          grid={{ horizontal: true }}
          sx={{
            "& .MuiLineElement-root[data-series-id='predicted']": {
              strokeDasharray: "8 4",
              strokeWidth: 3,
            },
            "& .MuiLineElement-root[data-series-id='actual']": {
              strokeWidth: 2,
            },
          }}
        />
      </Box>

      {/* Model Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Ensemble Model Architecture
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>Algorithm:</strong> {modelData.ensemble.algorithm}
          <br />• <strong>Ensemble Weights:</strong> Linear (
          {(modelData.ensemble.weights.linear * 100).toFixed(1)}%), Polynomial (
          {(modelData.ensemble.weights.poly * 100).toFixed(1)}%), Exp Smoothing
          ({(modelData.ensemble.weights.exp * 100).toFixed(1)}%), Moving Avg (
          {(modelData.ensemble.weights.ma * 100).toFixed(1)}%)
          <br />• <strong>Training Period:</strong>{" "}
          {modelData.metrics.trainingYears} years (
          {modelData.metrics.datasetEndYear -
            modelData.metrics.trainingYears +
            1}
          -{modelData.metrics.datasetEndYear})
          <br />• <strong>Training Data:</strong> {modelData.historical.length}{" "}
          historical data points from Global Carbon Budget 2025
          <br />• <strong>Model Performance:</strong> Ensemble R² ={" "}
          {(modelData.models.ensemble.r2 * 100).toFixed(2)}%, MAPE ={" "}
          {modelData.models.ensemble.mape.toFixed(2)}%
          <br />• <strong>Individual Models:</strong> Linear R² ={" "}
          {(modelData.models.linear.r2 * 100).toFixed(2)}%, Polynomial R² ={" "}
          {(modelData.models.polynomial.r2 * 100).toFixed(2)}%
          <br />• <strong>Prediction Period:</strong>{" "}
          {modelData.metrics.predictionStartYear}-
          {modelData.predictions[modelData.predictions.length - 1].year} (starts
          after dataset ends)
          <br />• <strong>Confidence Levels:</strong> High (years 1-3), Medium
          (years 4-7), Low (years 8-10)
          <br />• <strong>Note:</strong> Predictions assume continuation of
          recent trends and do not account for policy changes, technological
          breakthroughs, or unforeseen events
        </Typography>
      </Alert>
    </Paper>
  );
}
