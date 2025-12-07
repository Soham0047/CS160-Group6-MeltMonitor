import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Stack,
  Fade,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import PublicIcon from "@mui/icons-material/Public";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SchoolIcon from "@mui/icons-material/School";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import VerifiedIcon from "@mui/icons-material/Verified";
import CalculateIcon from "@mui/icons-material/Calculate";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FlagIcon from "@mui/icons-material/Flag";
import {
  getBadges,
  getStreak,
  getQuizStats,
  getCarbonFootprint,
  getAIChatStats,
  getCompletedGoalsCount,
} from "../../services/localStorage";

// Badge definitions - focused on daily quiz completion and learning
export const BADGES = [
  // Quiz completion badges
  {
    id: "first_quiz",
    name: "First Steps",
    description: "Complete your first daily quiz",
    icon: SchoolIcon,
    requirement: { type: "quizzes_completed", count: 1 },
    color: "#4caf50",
    rarity: "common",
  },
  {
    id: "quiz_enthusiast",
    name: "Quiz Enthusiast",
    description: "Complete 5 daily quizzes",
    icon: SchoolIcon,
    requirement: { type: "quizzes_completed", count: 5 },
    color: "#2196f3",
    rarity: "uncommon",
  },
  {
    id: "quiz_adept",
    name: "Quiz Adept",
    description: "Complete 10 daily quizzes",
    icon: SchoolIcon,
    requirement: { type: "quizzes_completed", count: 10 },
    color: "#673ab7",
    rarity: "rare",
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Complete 25 daily quizzes",
    icon: SchoolIcon,
    requirement: { type: "quizzes_completed", count: 25 },
    color: "#9c27b0",
    rarity: "rare",
  },
  {
    id: "quiz_legend",
    name: "Quiz Legend",
    description: "Complete 50 daily quizzes",
    icon: VerifiedIcon,
    requirement: { type: "quizzes_completed", count: 50 },
    color: "#ff9800",
    rarity: "legendary",
  },
  // Streak badges (based on daily quiz completion)
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Complete daily quizzes for 3 days in a row",
    icon: WhatshotIcon,
    requirement: { type: "streak", count: 3 },
    color: "#ff5722",
    rarity: "common",
  },
  {
    id: "dedicated_learner",
    name: "Dedicated Learner",
    description: "Complete daily quizzes for 7 days in a row",
    icon: WhatshotIcon,
    requirement: { type: "streak", count: 7 },
    color: "#e91e63",
    rarity: "uncommon",
  },
  {
    id: "streak_champion",
    name: "Streak Champion",
    description: "Complete daily quizzes for 14 days in a row",
    icon: WhatshotIcon,
    requirement: { type: "streak", count: 14 },
    color: "#9c27b0",
    rarity: "rare",
  },
  {
    id: "climate_champion",
    name: "Climate Champion",
    description: "Complete daily quizzes for 30 days in a row",
    icon: StarIcon,
    requirement: { type: "streak", count: 30 },
    color: "#ffd700",
    rarity: "legendary",
  },
  // Perfect score badges
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get 100% on a daily quiz",
    icon: EmojiEventsIcon,
    requirement: { type: "perfect_quiz", count: 1 },
    color: "#ffc107",
    rarity: "uncommon",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Get 100% on 5 daily quizzes",
    icon: EmojiEventsIcon,
    requirement: { type: "perfect_quiz", count: 5 },
    color: "#ff9800",
    rarity: "rare",
  },
  // Carbon Calculator badges
  {
    id: "carbon_aware",
    name: "Carbon Aware",
    description: "Calculate your personal carbon footprint",
    icon: CalculateIcon,
    requirement: { type: "carbon_calculated", count: 1 },
    color: "#4caf50",
    rarity: "common",
  },
  // AI Assistant badges
  {
    id: "curious_learner",
    name: "Curious Learner",
    description: "Ask the AI assistant 5 questions",
    icon: SmartToyIcon,
    requirement: { type: "ai_messages", count: 5 },
    color: "#00bcd4",
    rarity: "common",
  },
  {
    id: "climate_researcher",
    name: "Climate Researcher",
    description: "Ask the AI assistant 25 questions",
    icon: SmartToyIcon,
    requirement: { type: "ai_messages", count: 25 },
    color: "#3f51b5",
    rarity: "uncommon",
  },
  // Goal badges
  {
    id: "goal_setter",
    name: "Goal Setter",
    description: "Complete your first learning goal",
    icon: FlagIcon,
    requirement: { type: "goals_completed", count: 1 },
    color: "#8bc34a",
    rarity: "common",
  },
  {
    id: "goal_crusher",
    name: "Goal Crusher",
    description: "Complete 5 learning goals",
    icon: FlagIcon,
    requirement: { type: "goals_completed", count: 5 },
    color: "#ff5722",
    rarity: "uncommon",
  },
  // Saved Views badge
  {
    id: "data_analyst",
    name: "Data Analyst",
    description: "Save 5 custom views",
    icon: AutoGraphIcon,
    requirement: { type: "saved_views", count: 5 },
    color: "#3f51b5",
    rarity: "uncommon",
  },
  // Home country badge
  {
    id: "home_expert",
    name: "Home Expert",
    description: "Set your home country",
    icon: PublicIcon,
    requirement: { type: "home_country_set", count: 1 },
    color: "#8bc34a",
    rarity: "common",
  },
];

const RARITY_COLORS = {
  common: { bg: "rgba(76, 175, 80, 0.1)", border: "#4caf50" },
  uncommon: { bg: "rgba(33, 150, 243, 0.1)", border: "#2196f3" },
  rare: { bg: "rgba(156, 39, 176, 0.1)", border: "#9c27b0" },
  legendary: { bg: "rgba(255, 152, 0, 0.1)", border: "#ff9800" },
};

/**
 * Check if a badge is unlocked based on user progress
 */
export function checkBadgeUnlocked(badge, userProgress) {
  const { type, count } = badge.requirement;

  switch (type) {
    case "streak":
      return (userProgress.longestStreak || 0) >= count;
    case "quizzes_completed":
      return (userProgress.quizzesCompleted || 0) >= count;
    case "perfect_quiz":
      return (userProgress.perfectScores || 0) >= count;
    case "saved_views":
      return (userProgress.savedViews || 0) >= count;
    case "home_country_set":
      return userProgress.hasHomeCountry || false;
    case "carbon_calculated":
      return userProgress.hasCarbonFootprint || false;
    case "ai_messages":
      return (userProgress.aiMessagesCount || 0) >= count;
    case "goals_completed":
      return (userProgress.goalsCompleted || 0) >= count;
    default:
      return false;
  }
}

/**
 * Get user progress for badge calculation
 */
export function getUserProgress() {
  const streak = getStreak();
  const quizStats = getQuizStats?.() || { completed: 0, perfectScores: 0 };
  const savedViews = JSON.parse(
    localStorage.getItem("meltmonitor_saved_views") || "[]"
  );
  const homeCountry = localStorage.getItem("meltmonitor_home_country");
  const carbonFootprint = getCarbonFootprint();
  const aiChatStats = getAIChatStats();
  const goalsCompleted = getCompletedGoalsCount();

  return {
    longestStreak: streak.longestStreak,
    currentStreak: streak.count,
    quizzesCompleted: quizStats.completed,
    perfectScores: quizStats.perfectScores || 0,
    savedViews: savedViews.length,
    hasHomeCountry: !!homeCountry,
    hasCarbonFootprint: !!carbonFootprint,
    aiMessagesCount: aiChatStats.messagesCount || 0,
    goalsCompleted: goalsCompleted,
  };
}

/**
 * BadgeCard - Single badge display
 */
export function BadgeCard({ badge, unlocked, progress = 0 }) {
  const Icon = badge.icon;
  const rarity = RARITY_COLORS[badge.rarity];

  return (
    <Tooltip
      title={
        unlocked
          ? badge.description
          : `${badge.description} (${progress}% progress)`
      }
      arrow
    >
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          textAlign: "center",
          background: unlocked ? rarity.bg : "rgba(0,0,0,0.05)",
          border: `2px solid ${unlocked ? rarity.border : "#e0e0e0"}`,
          opacity: unlocked ? 1 : 0.6,
          transition: "all 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            transform: unlocked ? "scale(1.05)" : "none",
            boxShadow: unlocked ? `0 8px 24px ${rarity.border}40` : "none",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            mb: 1,
          }}
        >
          <Icon
            sx={{
              fontSize: 48,
              color: unlocked ? badge.color : "#bdbdbd",
            }}
          />
          {!unlocked && (
            <LockIcon
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                fontSize: 20,
                color: "#757575",
                bgcolor: "white",
                borderRadius: "50%",
                p: 0.25,
              }}
            />
          )}
        </Box>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {badge.name}
        </Typography>
        <Chip
          label={badge.rarity}
          size="small"
          sx={{
            mt: 0.5,
            fontSize: 10,
            height: 20,
            bgcolor: unlocked ? rarity.border : "#e0e0e0",
            color: "white",
            textTransform: "capitalize",
          }}
        />
        {!unlocked && progress > 0 && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.1)",
            }}
          />
        )}
      </Paper>
    </Tooltip>
  );
}

/**
 * BadgeGrid - Display all badges
 */
export function BadgeGrid() {
  const [progress, setProgress] = useState(() => getUserProgress());
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    setProgress(getUserProgress());
  }, []);

  const unlockedCount = BADGES.filter((b) =>
    checkBadgeUnlocked(b, progress)
  ).length;

  const calculateProgress = (badge) => {
    const { type, count } = badge.requirement;
    let current = 0;

    switch (type) {
      case "streak":
        current = progress.longestStreak || 0;
        break;
      case "quizzes_completed":
        current = progress.quizzesCompleted || 0;
        break;
      case "perfect_quiz":
        current = progress.perfectScores || 0;
        break;
      case "saved_views":
        current = progress.savedViews || 0;
        break;
      case "home_country_set":
        current = progress.hasHomeCountry ? 1 : 0;
        break;
      case "carbon_calculated":
        current = progress.hasCarbonFootprint ? 1 : 0;
        break;
      case "ai_messages":
        current = progress.aiMessagesCount || 0;
        break;
      case "goals_completed":
        current = progress.goalsCompleted || 0;
        break;
      default:
        current = 0;
    }

    return Math.min(100, Math.round((current / count) * 100));
  };

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <EmojiEventsIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Achievements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unlockedCount}/{BADGES.length} badges unlocked
          </Typography>
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={(unlockedCount / BADGES.length) * 100}
        sx={{
          mb: 3,
          height: 8,
          borderRadius: 4,
          bgcolor: "rgba(102, 126, 234, 0.2)",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 4,
          },
        }}
      />

      <Grid container spacing={2}>
        {BADGES.map((badge) => {
          const unlocked = checkBadgeUnlocked(badge, progress);
          const badgeProgress = calculateProgress(badge);

          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={badge.id}>
              <BadgeCard
                badge={badge}
                unlocked={unlocked}
                progress={badgeProgress}
              />
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

/**
 * BadgeSummary - Compact badge display for profile
 */
export function BadgeSummary() {
  const progress = getUserProgress();
  const unlockedBadges = BADGES.filter((b) => checkBadgeUnlocked(b, progress));
  const recentBadges = unlockedBadges.slice(-3);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,152,0,0.1) 100%)",
        border: "1px solid rgba(255,215,0,0.3)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <EmojiEventsIcon sx={{ color: "#ffd700" }} />
        <Typography variant="subtitle2" fontWeight={700}>
          {unlockedBadges.length} Badges Earned
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        {recentBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <Tooltip key={badge.id} title={badge.name}>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 24, color: badge.color }} />
              </Box>
            </Tooltip>
          );
        })}
        {unlockedBadges.length > 3 && (
          <Chip
            label={`+${unlockedBadges.length - 3}`}
            size="small"
            sx={{ bgcolor: "white" }}
          />
        )}
      </Stack>
    </Paper>
  );
}

// Main BadgeSystem export - alias for BadgeGrid
export function BadgeSystem() {
  return <BadgeGrid />;
}

export default BadgeGrid;
