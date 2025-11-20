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
import { useDashboardData } from "../../hooks/useDashboardData.jsx";

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData();
  const [unit, setUnit] = useState("C");

  // handle when waiting for the API or when these is no current data
  if (loading || !data) {
    return (
      <Container maxwidth="xl" sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div>Dashboard data is being fetched...</div>
      </Container>
    );
  }
  
  // handle when there is an error during data fetch
  if (error) {
    return (
      <Container maxwidth="xl" sx={{ py: 3,  display: "flex", flexDirection: "column", alignitems: "center" }}>
        <div>Error has occured, Sorry...</div>
      </Container>
    );
  }

  const x = Array.from({ length: data.co2Series.length }, (_, i) => i + 1);
  // set the x axis for the co2 chart
  const co2x = Array.from({ length: data.co2Series.length }, (_, i) => i + 1);
  // set the x axis for the temp chart
  const tempx = Array.from({ length: data.tempSeries.length}, (_, i) => i + 1);
  // conversion for the unit toggle
  const tempLatest = data.tempSeries.at(-1);
  const tempValue = unit === "C" ? tempLatest : (tempLatest * 9) / 5 + 32;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* KPI row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="CO₂ (ppm)"
            value={data.co2Series.at(-1).toFixed(1)}
            sublabel="Last updated: now"
            delta={data.difference.co2}
            icon={<ShowChartIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label={`Global Temp (°${unit})`}
            value={tempValue.toFixed(2)}
            sublabel="Monthly avg"
            delta={data.difference.temp}
            icon={<ThermostatIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Glacier Index"
            value={data.glacierIndex.at(-1)}
            sublabel="Model proxy"
            delta={data.difference.glacier}
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
              CO₂ Trend Over Last 4 weeks
            </Typography>
            <SparkLine x={co2x} series={data.co2Series} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Temperature Over Last 12 Months
            </Typography>
            <SparkLine x={tempx} series={data.tempSeries} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Glacier Index
            </Typography>
            <BarMini x={x.slice(8)} series={data.glacierIndex} />
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
          href="https://data.giss.nasa.gov/gistemp/"
          target="_blank"
          rel="noreferrer"
        >
          NASA GISTEMP
        </Link>
        ,{" "}
        <Link
          href="https://global-warming.org/"
          target="_blank"
          rel="noreferrer"
        >
          CLIMATE ACCOUNTABILITY API
        </Link>
        ,{" "}
        <Link
          href="https://gml.noaa.gov/ccgg/trends/gl_trend.html"
          target="_blank"
          rel="noreferrer"
          >
          NOAA GML
        </Link>
      </Box>
    </Container>
  );
}
