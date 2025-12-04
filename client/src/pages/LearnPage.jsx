import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Fade,
  Grow,
  Chip,
  LinearProgress,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalculateIcon from "@mui/icons-material/Calculate";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import PublicIcon from "@mui/icons-material/Public";
import StarIcon from "@mui/icons-material/Star";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import QuizEngine from "../components/Learning/QuizEngine";
import { BadgeSystem } from "../components/Learning/BadgeSystem";
import { CarbonCalculator } from "../components/Learning/CarbonCalculator";
import { GoalTracker } from "../components/Learning/GoalTracker";
import { CountryComparison } from "../components/Learning/CountryComparison";
import { Leaderboard } from "../components/Learning/SocialFeatures";
import {
  ClimateChat,
  SmartRecommendations,
} from "../components/Learning/AIFeatures";
import {
  StudyStreak,
  DailyQuizReminder,
} from "../components/Learning/StudyStreak";
import GlossaryTooltip from "../components/Learning/GlossaryTooltip";
import DailyTerms from "../components/Learning/DailyTerms";
import {
  getStreak,
  getQuizStats,
  getStreakStatus,
} from "../services/localStorage";
import {
  BADGES,
  checkBadgeUnlocked,
  getUserProgress,
} from "../components/Learning/BadgeSystem";

/**
 * Tab panel helper
 */
function TabPanel({ children, value, index, ...props }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`learn-tabpanel-${index}`}
      aria-labelledby={`learn-tab-${index}`}
      {...props}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

/**
 * Overview Stats Card
 */
function OverviewStats() {
  const streak = getStreak();
  const quizStats = getQuizStats();
  const streakStatus = getStreakStatus();

  // Calculate earned badges dynamically
  const userProgress = getUserProgress();
  const earnedBadges = BADGES.filter((badge) =>
    checkBadgeUnlocked(badge, userProgress)
  ).length;
  const totalBadges = BADGES.length;

  // Calculate accuracy properly
  const totalQuestions = quizStats.totalQuestions || quizStats.completed * 5;
  const correctAnswers = quizStats.totalCorrect || quizStats.correct || 0;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const stats = [
    {
      icon: WhatshotIcon,
      label: "Quiz Streak",
      value: `${streak.count} days`,
      color: "#ff9800",
      subtext: streakStatus.completed
        ? "✅ Done today!"
        : streakStatus.atRisk
          ? "⚠️ Take quiz!"
          : "Start today!",
    },
    {
      icon: QuizIcon,
      label: "Quizzes Completed",
      value: quizStats.completed,
      color: "#2196f3",
      subtext:
        quizStats.completed > 0
          ? `${accuracy}% accuracy`
          : "Take your first quiz!",
    },
    {
      icon: EmojiEventsIcon,
      label: "Perfect Scores",
      value: quizStats.perfectScores || 0,
      color: "#4caf50",
      subtext: quizStats.perfectScores > 0 ? "Keep it up!" : "Aim for 100%!",
    },
    {
      icon: StarIcon,
      label: "Badges Earned",
      value: `${earnedBadges}/${totalBadges}`,
      color: "#9c27b0",
      subtext:
        earnedBadges < totalBadges ? "Collect them all!" : "🎉 All badges!",
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              textAlign: "center",
              height: "100%",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}40 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <stat.icon sx={{ color: stat.color, fontSize: 24 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stat.value}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {stat.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stat.subtext}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Quick Actions Grid
 */
function QuickActions({ onTabChange }) {
  const actions = [
    {
      icon: QuizIcon,
      label: "Take a Quiz",
      description: "Test your climate knowledge",
      color: "#667eea",
      tab: 1,
    },
    {
      icon: CalculateIcon,
      label: "Calculate Footprint",
      description: "Estimate your carbon impact",
      color: "#4caf50",
      tab: 3,
    },
    {
      icon: CompareArrowsIcon,
      label: "Compare Countries",
      description: "Analyze emissions side-by-side",
      color: "#ff9800",
      tab: 5,
    },
    {
      icon: TrackChangesIcon,
      label: "Set a Goal",
      description: "Track your learning progress",
      color: "#e91e63",
      tab: 4,
    },
  ];

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        mb: 3,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action) => (
          <Grid size={{ xs: 6, md: 3 }} key={action.label}>
            <Paper
              onClick={() => onTabChange(action.tab)}
              elevation={0}
              sx={{
                p: 2.5,
                cursor: "pointer",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: `linear-gradient(135deg, ${action.color}08 0%, ${action.color}15 100%)`,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: action.color,
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${action.color}30`,
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}40 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                <action.icon sx={{ color: action.color, fontSize: 24 }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {action.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {action.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

/**
 * Learning Progress Overview
 */
function LearningProgress() {
  const quizStats = getQuizStats();
  const streak = getStreak();

  // Calculate earned badges dynamically
  const userProgress = getUserProgress();
  const earnedBadges = BADGES.filter((badge) =>
    checkBadgeUnlocked(badge, userProgress)
  ).length;
  const totalBadges = BADGES.length;

  const progress = [
    {
      label: "Quiz Streak",
      value: Math.min((streak.count / 30) * 100, 100),
      target: "30 day streak",
    },
    {
      label: "Quiz Mastery",
      value: Math.min((quizStats.completed / 20) * 100, 100),
      target: "20 quizzes",
    },
    {
      label: "Badge Collection",
      value: (earnedBadges / totalBadges) * 100,
      target: `${totalBadges} badges`,
    },
  ];

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
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
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Learning Progress
      </Typography>
      <Stack spacing={2}>
        {progress.map((item) => (
          <Box key={item.label}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goal: {item.target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.value}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(0,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background:
                    item.value >= 100
                      ? "linear-gradient(90deg, #4caf50, #8bc34a)"
                      : "linear-gradient(90deg, #667eea, #764ba2)",
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

/**
 * Main Learn Page Component
 */
export default function LearnPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [emissionsData, setEmissionsData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh stats after quiz completion or other activities
  const handleRefreshStats = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Load emissions data for quizzes and comparisons
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/owid-co2-data.csv");
        const text = await response.text();
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",");

        const countryIdx = headers.indexOf("country");
        const yearIdx = headers.indexOf("year");
        const co2Idx = headers.indexOf("co2");
        const co2PerCapitaIdx = headers.indexOf("co2_per_capita");
        const isoIdx = headers.indexOf("iso_code");

        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          if (values[countryIdx] && values[yearIdx] && values[co2Idx]) {
            data.push({
              country: values[countryIdx].replace(/"/g, ""),
              year: parseInt(values[yearIdx]),
              co2: parseFloat(values[co2Idx]) || 0,
              co2_per_capita: parseFloat(values[co2PerCapitaIdx]) || 0,
              iso_code: values[isoIdx]?.replace(/"/g, "") || "",
            });
          }
        }
        setEmissionsData(data);
      } catch (err) {
        console.error("Failed to load emissions data:", err);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { icon: SchoolIcon, label: "Overview" },
    { icon: QuizIcon, label: "Quizzes" },
    { icon: EmojiEventsIcon, label: "Badges" },
    { icon: CalculateIcon, label: "Calculator" },
    { icon: TrackChangesIcon, label: "Goals" },
    { icon: CompareArrowsIcon, label: "Compare" },
    { icon: LeaderboardIcon, label: "Leaderboard" },
    { icon: SmartToyIcon, label: "AI Assistant" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: 6,
      }}
    >
      {/* Header */}
      <Fade in timeout={800}>
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)",
            backdropFilter: "blur(20px)",
            py: 6,
            mb: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 48, color: "white" }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                }}
              >
                Learning Center
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
              Master climate data through interactive quizzes, track your
              progress, earn badges, and become a climate expert.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                label="🎯 Interactive Quizzes"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="📊 Track Progress"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="🏆 Earn Badges"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="🤖 AI Assistant"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Container>
        </Box>
      </Fade>

      <Container maxWidth="lg">
        {/* Stats Overview */}
        <Grow in timeout={1000}>
          <Box sx={{ mb: 3 }}>
            {/* Daily Quiz Reminder Alert */}
            <DailyQuizReminder onTakeQuiz={() => setActiveTab(1)} />
            <OverviewStats key={`stats-${refreshKey}`} />
          </Box>
        </Grow>

        {/* Tabs Navigation */}
        <Fade in timeout={1200}>
          <Paper
            sx={{
              borderRadius: 3,
              mb: 3,
              overflow: "hidden",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 56,
                "& .MuiTab-root": {
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  minHeight: 56,
                  px: 2.5,
                  gap: 1,
                },
                "& .Mui-selected": {
                  color: "#667eea !important",
                },
                "& .MuiTabs-indicator": {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  height: 3,
                },
                "& .MuiTabs-flexContainer": {
                  gap: 0,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.label}
                  icon={<tab.icon sx={{ fontSize: 20 }} />}
                  label={tab.label}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>
        </Fade>

        {/* Tab Content */}
        <Fade in timeout={1400}>
          <Box>
            <TabPanel value={activeTab} index={0}>
              <Box>
                <QuickActions onTabChange={setActiveTab} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <LearningProgress key={`progress-${refreshKey}`} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <StudyStreak onTakeQuiz={() => setActiveTab(1)} />
                  </Grid>
                </Grid>

                {/* Daily Terms Section */}
                <Box sx={{ mt: 3 }}>
                  <DailyTerms />
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <QuizEngine
                emissionsData={emissionsData}
                onQuizComplete={handleRefreshStats}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <BadgeSystem />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <CarbonCalculator />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <GoalTracker />
            </TabPanel>

            <TabPanel value={activeTab} index={5}>
              <CountryComparison emissionsData={emissionsData} />
            </TabPanel>

            <TabPanel value={activeTab} index={6}>
              <Leaderboard />
            </TabPanel>

            <TabPanel value={activeTab} index={7}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <ClimateChat emissionsData={emissionsData} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <SmartRecommendations />
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
