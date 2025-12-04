import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  Alert,
  Button,
} from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import QuizIcon from "@mui/icons-material/Quiz";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import {
  getStreak as getLocalStreak,
  recordDailyQuiz as recordLocalDailyQuiz,
  getStreakStatus,
  hasCompletedDailyQuiz,
  shouldShowDailyReminder,
  dismissDailyReminder,
  getQuizStats,
} from "../../services/localStorage";
import * as api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

/**
 * StreakBadge - Small badge showing current streak
 */
export function StreakBadge({ showLabel = true }) {
  const { isAuthenticated } = useAuth();
  const [streak, setStreak] = useState(() => getLocalStreak());

  useEffect(() => {
    const fetchStreak = async () => {
      if (isAuthenticated) {
        try {
          const backendStreak = await api.getStreak();
          setStreak(backendStreak);
        } catch (e) {
          console.debug("Using local streak:", e);
          setStreak(getLocalStreak());
        }
      } else {
        setStreak(getLocalStreak());
      }
    };
    fetchStreak();
  }, [isAuthenticated]);

  if (streak.count === 0) {
    return null;
  }

  return (
    <Tooltip
      title={`${streak.count}-day learning streak! Best: ${streak.longestStreak} days`}
    >
      <Chip
        icon={<WhatshotIcon />}
        label={showLabel ? `${streak.count} day streak` : streak.count}
        size="small"
        sx={{
          background:
            streak.count >= 7
              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              : streak.count >= 3
                ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
          "& .MuiChip-icon": {
            color: "white",
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * StreakCard - Full streak display for profile page
 */
export function StreakCard({ onTakeQuiz }) {
  const { isAuthenticated } = useAuth();
  const [streak, setStreak] = useState(() => getLocalStreak());
  const [quizStats, setQuizStats] = useState(() => getQuizStats());
  const [streakStatus, setStreakStatus] = useState(() => getStreakStatus());

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          const backendStreak = await api.getStreak();
          setStreak(backendStreak);
        } catch (e) {
          console.debug("Using local data:", e);
          setStreak(getLocalStreak());
        }
      } else {
        setStreak(getLocalStreak());
      }
      setQuizStats(getQuizStats());
      setStreakStatus(getStreakStatus());
    };
    fetchData();
  }, [isAuthenticated]);

  const getStreakMessage = () => {
    if (streakStatus.completed)
      return "✅ Daily quiz completed! Come back tomorrow.";
    if (streak.count === 0) return "Take a quiz to start your streak!";
    if (streakStatus.atRisk) return `⚠️ ${streakStatus.message}`;
    if (streak.count === 1)
      return "Great start! Come back tomorrow for your next quiz.";
    if (streak.count < 7)
      return `${7 - streak.count} more days to reach a week!`;
    if (streak.count < 30) return "Amazing consistency! Keep it up!";
    return "You're a climate quiz champion! 🏆";
  };

  const getStreakColor = () => {
    if (streak.count >= 30) return "#f5576c";
    if (streak.count >= 7) return "#fa709a";
    if (streak.count >= 3) return "#667eea";
    return "#9ca3af";
  };

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${getStreakColor()} 0%, ${getStreakColor()}dd 100%)`,
            color: "white",
          }}
        >
          <WhatshotIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {streak.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Day Quiz Streak
          </Typography>
        </Box>
        {streak.longestStreak > 0 && streak.longestStreak > streak.count && (
          <Tooltip title="Your longest streak">
            <Chip
              icon={<EmojiEventsIcon />}
              label={`Best: ${streak.longestStreak}`}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {getStreakMessage()}
      </Typography>

      {/* Daily Quiz Status */}
      {!streakStatus.completed && (
        <Alert
          severity={streakStatus.atRisk ? "warning" : "info"}
          icon={<QuizIcon />}
          action={
            onTakeQuiz && (
              <Button color="inherit" size="small" onClick={onTakeQuiz}>
                Take Quiz
              </Button>
            )
          }
          sx={{ mb: 2 }}
        >
          {streakStatus.atRisk
            ? "Don't lose your streak! Complete today's quiz."
            : "Complete a quiz today to build your streak!"}
        </Alert>
      )}

      {/* Quiz Stats */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "rgba(102, 126, 234, 0.1)",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            Quizzes Completed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quizStats.completed} total
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min((quizStats.completed / 50) * 100, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(102, 126, 234, 0.2)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 4,
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {quizStats.perfectScores || 0} perfect scores •{" "}
          {quizStats.correct || 0} correct answers
        </Typography>
      </Box>
    </Paper>
  );
}

/**
 * Hook to track quiz completion for streak
 */
export function useStreakTracker() {
  const { isAuthenticated } = useAuth();

  const trackQuizCompletion = useCallback(async () => {
    // Always record locally
    const localUpdated = recordLocalDailyQuiz();

    // If authenticated, also sync to backend
    if (isAuthenticated) {
      try {
        const backendStreak = await api.recordActivity();
        return backendStreak;
      } catch (e) {
        console.debug("Failed to sync activity to backend:", e);
      }
    }

    return localUpdated;
  }, [isAuthenticated]);

  return { trackQuizCompletion };
}

/**
 * Daily Quiz Reminder Alert Component
 */
export function DailyQuizReminder({ onTakeQuiz, onDismiss }) {
  const [show, setShow] = useState(shouldShowDailyReminder());
  const streakStatus = getStreakStatus();

  if (!show) return null;

  const handleDismiss = () => {
    dismissDailyReminder();
    setShow(false);
    if (onDismiss) onDismiss();
  };

  const isAtRisk = streakStatus.atRisk;

  return (
    <Paper
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        background: "rgba(255, 255, 255, 0.95)",
        border: isAtRisk
          ? "2px solid rgba(255, 152, 0, 0.5)"
          : "2px solid rgba(102, 126, 234, 0.4)",
        backdropFilter: "blur(10px)",
        boxShadow: isAtRisk
          ? "0 4px 20px rgba(255, 152, 0, 0.25)"
          : "0 4px 20px rgba(102, 126, 234, 0.2)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isAtRisk
              ? "linear-gradient(135deg, #ff9800 0%, #ffc107 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            flexShrink: 0,
            boxShadow: isAtRisk
              ? "0 4px 12px rgba(255, 152, 0, 0.4)"
              : "0 4px 12px rgba(102, 126, 234, 0.4)",
          }}
        >
          {isAtRisk ? (
            <WhatshotIcon sx={{ fontSize: 26, color: "white" }} />
          ) : (
            <QuizIcon sx={{ fontSize: 26, color: "white" }} />
          )}
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {isAtRisk
              ? `🔥 ${streakStatus.streak}-Day Streak at Risk!`
              : "📚 Daily Quiz Available"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAtRisk
              ? "Complete today's quiz to keep your streak going!"
              : "Take today's quiz to build your learning streak!"}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={onTakeQuiz}
          sx={{
            px: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            color: "white",
            background: isAtRisk
              ? "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              background: isAtRisk
                ? "linear-gradient(135deg, #f57c00 0%, #e65100 100%)"
                : "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            },
          }}
        >
          Take Quiz
        </Button>
        <Tooltip title="Dismiss for today">
          <Button
            size="small"
            onClick={handleDismiss}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              p: 0,
              borderRadius: 1,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.05)",
              },
            }}
          >
            ✕
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
}

// Main StudyStreak export - alias for StreakCard
export function StudyStreak({ onTakeQuiz }) {
  return <StreakCard onTakeQuiz={onTakeQuiz} />;
}

export { recordLocalDailyQuiz as recordDailyQuiz };
