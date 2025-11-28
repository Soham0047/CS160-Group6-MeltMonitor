import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
import { useMemo, useState } from "react";
import KpiCard from "./KpiCard.jsx";
import SparkLine from "../Charts/SparkLine.jsx";
import BarMini from "../Charts/BarMini.jsx";
import WorldMapPlaceholder from "./WorldMapPlaceholder.jsx";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import PublicIcon from "@mui/icons-material/Public";
import { useDashboardData } from "../../hooks/useDashboardData.jsx";

export default function DashboardPage() {
  const x = useMemo(() => Array.from({ length: 24 }, (_, i) => i + 1), []);
  const co2Series = useMemo(() => x.map((i) => 380 + Math.sin(i / 2) * 5), [x]);
  const tempSeriesC = useMemo(
    () => x.map((i) => 14 + Math.cos(i / 3) * 0.2),
    [x]
  );
  const glacierSeries = useMemo(
    () => x.slice(8).map((i) => Math.max(0, 100 - i * 2)),
    [x]
  );

  const [unit, setUnit] = useState("C");
  const tempLatest = tempSeriesC.at(-1);
  const tempValue = unit === "C" ? tempLatest : (tempLatest * 9) / 5 + 32;
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: 4,
      }}
    >
      <Fade in timeout={800}>
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            py: 6,
            mb: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <PublicIcon sx={{ fontSize: 48, color: "white" }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                }}
              >
                Climate Dashboard
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
                maxWidth: "800px",
              }}
            >
              Real-time monitoring of global climate indicators
            </Typography>
          </Container>
        </Box>
      </Fade>

      <Container maxWidth="xl" sx={{ mt: -2 }}>
        <Grow in timeout={1000}>
          <Grid container spacing={3}>
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
              <Paper
                sx={{
                  p: 2.5,
                  height: "100%",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Temperature Unit
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={unit}
                    onChange={(_, v) => v && setUnit(v)}
                    sx={{
                      "& .MuiToggleButton-root": {
                        borderRadius: 2,
                        px: 2.5,
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                        "&.Mui-selected": {
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                          color: "white",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #5568d3, #65408a)",
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="C">°C</ToggleButton>
                    <ToggleButton value="F">°F</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grow>

        <Fade in timeout={1200}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, fontSize: 16 }}
                >
                  CO₂ Trend
                </Typography>
                <SparkLine x={x} series={co2Series} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, fontSize: 16 }}
                >
                  Temperature
                </Typography>
                <SparkLine x={x} series={tempSeriesC} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, fontSize: 16 }}
                >
                  Glacier Index
                </Typography>
                <BarMini x={x.slice(8)} series={glacierSeries} />
              </Paper>
            </Grid>
          </Grid>
        </Fade>

        <Zoom in timeout={1400}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, fontSize: 16 }}
                >
                  Global Locations
                </Typography>
                <WorldMapPlaceholder />
              </Paper>
            </Grid>
          </Grid>
        </Zoom>

        <Fade in timeout={1600}>
          <Box
            sx={{
              mt: 4,
              p: 2,
              fontSize: 14,
              color: "white",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Sources:{" "}
            <Link
              href="https://gml.noaa.gov/ccgg/trends/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "white", fontWeight: 600 }}
            >
              NOAA
            </Link>
            ,{" "}
            <Link
              href="https://data.giss.nasa.gov/gistemp/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "white", fontWeight: 600 }}
            >
              NASA GISTEMP
            </Link>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
