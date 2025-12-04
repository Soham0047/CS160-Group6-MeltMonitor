import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScienceIcon from "@mui/icons-material/Science";
import GavelIcon from "@mui/icons-material/Gavel";
import NatureIcon from "@mui/icons-material/Nature";
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import SchoolIcon from "@mui/icons-material/School";
import {
  getDailyTerms,
  clearDailyTerms,
  isOpenAIConfigured,
} from "../../services/openaiService";

const CATEGORY_CONFIG = {
  science: { icon: ScienceIcon, color: "#667eea", label: "Science" },
  policy: { icon: GavelIcon, color: "#f59e0b", label: "Policy" },
  environment: { icon: NatureIcon, color: "#10b981", label: "Environment" },
  measurement: { icon: SpeedIcon, color: "#8b5cf6", label: "Measurement" },
  energy: { icon: BoltIcon, color: "#ef4444", label: "Energy" },
  weather: { icon: ThunderstormIcon, color: "#6b7280", label: "Weather" },
};

const DIFFICULTY_CONFIG = {
  beginner: { color: "#10b981", label: "Beginner" },
  intermediate: { color: "#f59e0b", label: "Intermediate" },
  advanced: { color: "#ef4444", label: "Advanced" },
};

export default function DailyTerms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchTerms = async (forceRefresh = false) => {
    if (!isOpenAIConfigured()) {
      setError("OpenAI API not configured");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (forceRefresh) {
        clearDailyTerms();
      }

      const termsData = await getDailyTerms();
      setTerms(termsData);
    } catch (err) {
      console.error("Failed to fetch daily terms:", err);
      setError("Failed to load today's terms");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTerms(true);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Show error state
  if (error && !loading) {
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <MenuBookIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Today's Climate Terms
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {error === "OpenAI API not configured"
            ? "Configure your OpenAI API key to see daily climate terms"
            : error}
        </Alert>
      </Paper>
    );
  }

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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <MenuBookIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Today's Climate Terms
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Learn 5 new terms every day
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Get new terms">
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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Expand each term to learn its meaning and context.
      </Typography>

      {/* Loading State */}
      {loading ? (
        <Box>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={56}
              sx={{ mb: 1, borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : (
        <Box>
          {terms.map((termData, index) => {
            const categoryConfig =
              CATEGORY_CONFIG[termData.category] || CATEGORY_CONFIG.science;
            const difficultyConfig =
              DIFFICULTY_CONFIG[termData.difficulty] ||
              DIFFICULTY_CONFIG.beginner;
            const CategoryIcon = categoryConfig.icon;

            return (
              <Accordion
                key={index}
                expanded={expanded === index}
                onChange={handleAccordionChange(index)}
                sx={{
                  mb: 1,
                  borderRadius: "12px !important",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    margin: "0 0 8px 0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderRadius: "12px",
                    "&.Mui-expanded": {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                      pr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        bgcolor: `${categoryConfig.color}15`,
                        color: categoryConfig.color,
                        display: "flex",
                      }}
                    >
                      <CategoryIcon fontSize="small" />
                    </Box>
                    <Typography fontWeight={600} sx={{ flex: 1 }}>
                      {termData.term}
                    </Typography>
                    <Chip
                      label={difficultyConfig.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        bgcolor: `${difficultyConfig.color}15`,
                        color: difficultyConfig.color,
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.7, color: "#444" }}
                  >
                    {termData.definition}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Chip
                      icon={
                        <CategoryIcon sx={{ fontSize: "14px !important" }} />
                      }
                      label={categoryConfig.label}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        bgcolor: `${categoryConfig.color}10`,
                        color: categoryConfig.color,
                        "& .MuiChip-icon": { color: categoryConfig.color },
                      }}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Daily tip */}
      {!loading && terms.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(102, 126, 234, 0.05)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <SchoolIcon sx={{ color: "#667eea", fontSize: 20 }} />
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Review these terms daily to build your climate
            vocabulary. New terms are generated every day!
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
