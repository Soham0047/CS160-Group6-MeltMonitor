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
} from "@mui/material";
import { useState } from "react";
import KpiCard from "./KpiCard.jsx";
import SparkLine from "../Charts/SparkLine.jsx";
import BarMini from "../Charts/BarMini.jsx";
import ClimateFactOfTheDay from "./ClimateFactOfTheDay.jsx";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import PublicIcon from "@mui/icons-material/Public";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useDashboardData } from "../../hooks/useDashboardData.jsx";

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData();
  const [unit, setUnit] = useState("C");

  // handle when waiting for the API or when these is no current data
  if (loading || !data) {
    return (
      <Container
        maxwidth="xl"
        sx={{
          py: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>Dashboard data is being fetched...</div>
      </Container>
    );
  }

  // handle when there is an error during data fetch
  if (error) {
    return (
      <Container
        maxwidth="xl"
        sx={{
          py: 3,
          display: "flex",
          flexDirection: "column",
          alignitems: "center",
        }}
      >
        <div>Error has occured, Sorry...</div>
      </Container>
    );
  }

  // set the x axis for the co2 chart
  const co2x = Array.from({ length: data.co2Series.length }, (_, i) => i + 1);
  // set the x axis for the temp chart
  const tempx = Array.from({ length: data.tempSeries.length }, (_, i) => i + 1);
  // set the x axis for the glacier chart
  const glacierx = Array.from(
    { length: data.glacierIndex.length },
    (_, i) => i + 1
  );

  // conversion for the unit toggle
  const tempLatest = data.tempSeries.at(-1);
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="CO₂ (ppm)"
                value={data.co2Series.at(-1).toFixed(1)}
                sublabel={
                  data.difference.co2 ? "vs last entry" : "Last updated: now"
                }
                delta={data.difference.co2}
                icon={<ShowChartIcon fontSize="small" />}
                secondarySublabel={data.difference.co2 ? "vs last entry" : ""}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label={`Global Temp (°${unit})`}
                value={tempValue.toFixed(2)}
                sublabel="Monthly avg"
                delta={data.difference.temp}
                icon={<ThermostatIcon fontSize="small" />}
                secondarySublabel={
                  data.difference.temp ? "vs last entry" : "Last updated: now"
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                label="Glacier Mass Loss in meters water"
                value={data.glacierIndex.at(-1)}
                sublabel="As of 2023"
                delta={data.difference.glacier}
                icon={<AcUnitIcon fontSize="small" />}
                secondarySublabel={
                  data.difference.glacier
                    ? "vs last entry"
                    : "Last updated: now"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
                  CO₂ Trend Over Last 4 weeks
                </Typography>
                <SparkLine x={co2x} series={data.co2Series} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                  Temperature Over Last 12 Months
                </Typography>
                <SparkLine x={tempx} series={data.tempSeries} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                  Glacier Mass Loss
                </Typography>
                <BarMini x={glacierx} series={data.glacierIndex} />
              </Paper>
            </Grid>
          </Grid>
        </Fade>

        {/* Climate Fact of the Day Section */}
        <Fade in timeout={1400}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <ClimateFactOfTheDay />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
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
                {/* Header */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LightbulbIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#1a1a2e" }}
                  >
                    Quick Tips
                  </Typography>
                </Box>

                {/* Tips List */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(102, 126, 234, 0.06)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#444", lineHeight: 1.6 }}
                    >
                      🤖 <strong>AI-Powered Facts</strong> — Our climate facts
                      are generated daily using the latest environmental
                      research.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(245, 158, 11, 0.06)",
                      border: "1px solid rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#444", lineHeight: 1.6 }}
                    >
                      🔄 <strong>Daily Updates</strong> — Check back every day
                      for fresh insights about climate change and
                      sustainability.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(16, 185, 129, 0.06)",
                      border: "1px solid rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#444", lineHeight: 1.6 }}
                    >
                      📚 <strong>Learn More</strong> — Click on related articles
                      to dive deeper into climate topics.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>

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
              GW AND CC API
            </Link>
            ,{" "}
            <Link
              href="https://gml.noaa.gov/ccgg/trends/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "white", fontWeight: 600 }}
            >
              NASA GISTEMP
            </Link>
            ,{" "}
            <Link
              href="https://gml.noaa.gov/ccgg/trends/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "white", fontWeight: 600 }}
            >
              NOAA GML
            </Link>
            ,{" "}
            <Link
              href="https://gml.noaa.gov/ccgg/trends/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "white", fontWeight: 600 }}
            >
              WGMS
            </Link>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
