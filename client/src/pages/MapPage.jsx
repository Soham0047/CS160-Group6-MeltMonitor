import { Container, Paper, Typography, Box, Stack, Chip } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import TimelineIcon from "@mui/icons-material/Timeline";
import ForestIcon from "@mui/icons-material/Forest";
import WorldMapLocal from "../components/Map/WorldMapLocal.jsx";
import CO2PredictionPanel from "../components/Map/CO2PredictionPanel.jsx";
import GlossaryTooltip from "../components/Learning/GlossaryTooltip.jsx";

console.log("🗺️ MapPage.jsx loaded");

export default function MapPage() {
  console.log("🗺️ MapPage rendering...");
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            color: "white",
            p: 5,
            borderRadius: 4,
            mb: 3,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={3}
            sx={{ mb: 3, position: "relative", zIndex: 1 }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PublicIcon sx={{ fontSize: 56 }} />
            </Box>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  textShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  mb: 1,
                }}
              >
                Global CO₂ Emissions
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  opacity: 0.95,
                }}
              >
                Interactive Time Series Analysis (1949-2024)
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, position: "relative", zIndex: 1 }}
          >
            <Chip
              icon={<TimelineIcon />}
              label="76 Years of Data"
              sx={{
                backgroundColor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                py: 2.5,
                px: 1,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.35)",
                  transform: "translateY(-2px)",
                },
              }}
            />
            <Chip
              icon={<ForestIcon />}
              label="Total & Per Capita Metrics"
              sx={{
                backgroundColor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                py: 2.5,
                px: 1,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.35)",
                  transform: "translateY(-2px)",
                },
              }}
            />
            <GlossaryTooltip
              termId="co2-emissions"
              iconColor="rgba(255,255,255,0.9)"
            />
            <GlossaryTooltip
              termId="per-capita-emissions"
              iconColor="rgba(255,255,255,0.9)"
            />
          </Stack>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.95,
              maxWidth: "900px",
              lineHeight: 1.8,
              fontSize: 16,
              position: "relative",
              zIndex: 1,
            }}
          >
            Explore how carbon dioxide emissions have evolved across the globe
            from 1949 to 2024. Toggle between total emissions and per capita
            metrics, drag the time slider to see historical trends, and hover
            over countries for detailed information about their environmental
            impact.
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 0,
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.2)",
            mt: 3,
          }}
        >
          <WorldMapLocal />
        </Paper>

        <CO2PredictionPanel />
      </Container>
    </Box>
  );
}
