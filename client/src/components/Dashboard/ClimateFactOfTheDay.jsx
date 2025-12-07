import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Skeleton,
  Chip,
  IconButton,
  Link,
  Tooltip,
  Alert,
  Collapse,
} from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Co2Icon from "@mui/icons-material/Co2";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import PetsIcon from "@mui/icons-material/Pets";
import BoltIcon from "@mui/icons-material/Bolt";
import WavesIcon from "@mui/icons-material/Waves";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import {
  getClimateFact,
  clearClimateFact,
  isOpenAIConfigured,
} from "../../services/openaiService";

const CATEGORY_CONFIG = {
  emissions: { icon: Co2Icon, color: "#ff6b6b", label: "Emissions" },
  climate: { icon: ThermostatIcon, color: "#ffa94d", label: "Climate" },
  solutions: {
    icon: EnergySavingsLeafIcon,
    color: "#51cf66",
    label: "Solutions",
  },
  wildlife: { icon: PetsIcon, color: "#845ef7", label: "Wildlife" },
  energy: { icon: BoltIcon, color: "#ffd43b", label: "Energy" },
  oceans: { icon: WavesIcon, color: "#339af0", label: "Oceans" },
  weather: { icon: ThunderstormIcon, color: "#868e96", label: "Weather" },
};

export default function ClimateFactOfTheDay() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFact = async (forceRefresh = false) => {
    if (!isOpenAIConfigured()) {
      setError("OpenAI API not configured");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (forceRefresh) {
        clearClimateFact();
      }

      const factData = await getClimateFact();
      setFact(factData);
    } catch (err) {
      console.error("Failed to fetch climate fact:", err);
      setError("Failed to load today's climate fact");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFact(true);
  };

  const categoryConfig = fact?.category
    ? CATEGORY_CONFIG[fact.category] || CATEGORY_CONFIG.climate
    : CATEGORY_CONFIG.climate;
  const CategoryIcon = categoryConfig.icon;

  // Show compact error state
  if (error && !loading) {
    return (
      <Paper
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #ffd700 0%, #ff9800 100%)",
              color: "white",
            }}
          >
            <LightbulbIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Climate Fact of the Day
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {error === "OpenAI API not configured"
            ? "Configure your OpenAI API key in .env to see daily climate facts"
            : error}
        </Alert>
      </Paper>
    );
  }

  return (
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #ffd700 0%, #ff9800 100%)",
              color: "white",
            }}
          >
            <LightbulbIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Climate Fact of the Day
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Get a new fact">
          <span>
            <IconButton
              onClick={handleRefresh}
              disabled={loading || refreshing}
              sx={{
                transition: "transform 0.3s ease",
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box>
          <Skeleton variant="rounded" height={24} width={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={24} />
          <Skeleton variant="text" height={24} />
          <Skeleton variant="text" height={24} width="60%" />
        </Box>
      ) : (
        <>
          {/* Category Chip */}
          {fact?.category && (
            <Chip
              icon={<CategoryIcon sx={{ fontSize: 16 }} />}
              label={categoryConfig.label}
              size="small"
              sx={{
                mb: 2,
                bgcolor: `${categoryConfig.color}20`,
                color: categoryConfig.color,
                fontWeight: 600,
                "& .MuiChip-icon": { color: categoryConfig.color },
              }}
            />
          )}

          {/* Fact Text */}
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              lineHeight: 1.7,
              fontSize: "1.05rem",
              color: "#333",
            }}
          >
            {fact?.fact}
          </Typography>

          {/* Source */}
          {fact?.source && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2, fontStyle: "italic" }}
            >
              Source: {fact.source}
            </Typography>
          )}

          {/* Related Articles Toggle */}
          {fact?.articles && fact.articles.length > 0 && (
            <>
              <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  py: 1,
                  px: 2,
                  mx: -2,
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  borderBottom: expanded
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "none",
                  "&:hover": {
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                <ArticleIcon sx={{ fontSize: 18, color: "#667eea" }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#667eea", flex: 1 }}
                >
                  Related Articles ({fact.articles.length})
                </Typography>
                {expanded ? (
                  <ExpandLessIcon sx={{ color: "#667eea" }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: "#667eea" }} />
                )}
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ pt: 2 }}>
                  {fact.articles.map((article, index) => (
                    <Link
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.1)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <OpenInNewIcon
                        sx={{ fontSize: 16, color: "#667eea", mt: 0.3 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "#333" }}
                        >
                          {article.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {article.source}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                </Box>
              </Collapse>
            </>
          )}
        </>
      )}
    </Paper>
  );
}
