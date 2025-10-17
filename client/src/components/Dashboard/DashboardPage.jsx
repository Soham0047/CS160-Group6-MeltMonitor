import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Link,
} from "@mui/material";
import { useMemo, useState } from "react";
import KpiCard from "./KpiCard.jsx";
import SparkLine from "../Charts/SparkLine.jsx";
import BarMini from "../Charts/BarMini.jsx";
import WorldMapPlaceholder from "./WorldMapPlaceholder.jsx";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AcUnitIcon from "@mui/icons-material/AcUnit";

export default function DashboardPage() {
  // Mock demo data for now
  const x = useMemo(() => Array.from({ length: 24 }, (_, i) => i + 1), []);
  const co2Series = useMemo(() => x.map((i) => 380 + Math.sin(i / 2) * 5), [x]); // ppm
  const tempSeriesC = useMemo(
    () => x.map((i) => 14 + Math.cos(i / 3) * 0.2),
    [x]
  ); // °C
  const glacierSeries = useMemo(
    () => x.slice(8).map((i) => Math.max(0, 100 - i * 2)),
    [x]
  );

  const [unit, setUnit] = useState("C");
  const tempLatest = tempSeriesC.at(-1);
  const tempValue = unit === "C" ? tempLatest : (tempLatest * 9) / 5 + 32;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* KPI row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="CO₂ (ppm)"
            value={co2Series.at(-1).toFixed(1)}
            sublabel="Last updated: now"
            delta={1.2}
            icon={<ShowChartIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label={`Global Temp (°${unit})`}
            value={tempValue.toFixed(2)}
            sublabel="7-day avg"
            delta={-0.3}
            icon={<ThermostatIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Glacier Index"
            value={glacierSeries.at(-1)}
            sublabel="Model proxy"
            delta={-0.8}
            icon={<AcUnitIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="overline" color="text.secondary">
              Unit
            </Typography>
            <Box>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={unit}
                onChange={(_, v) => v && setUnit(v)}
              >
                <ToggleButton value="C">°C</ToggleButton>
                <ToggleButton value="F">°F</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* charts row */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              CO₂ Trend
            </Typography>
            <SparkLine x={x} series={co2Series} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Temperature
            </Typography>
            <SparkLine x={x} series={tempSeriesC} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Glacier Index
            </Typography>
            <BarMini x={x.slice(8)} series={glacierSeries} />
          </Paper>
        </Grid>
      </Grid>

      {/* map row */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Locations
            </Typography>
            <WorldMapPlaceholder />
          </Paper>
        </Grid>
      </Grid>

      {/* sources row */}
      <Box sx={{ mt: 2, fontSize: 14, color: "text.secondary" }}>
        Sources:{" "}
        <Link
          href="https://gml.noaa.gov/ccgg/trends/"
          target="_blank"
          rel="noreferrer"
        >
          NOAA
        </Link>
        ,{" "}
        <Link
          href="https://data.giss.nasa.gov/gistemp/"
          target="_blank"
          rel="noreferrer"
        >
          NASA GISTEMP
        </Link>
        . (Add exact datasets later.)
      </Box>
    </Container>
  );
}
