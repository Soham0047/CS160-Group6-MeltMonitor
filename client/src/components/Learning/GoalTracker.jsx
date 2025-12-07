import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  IconButton,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QuizIcon from "@mui/icons-material/Quiz";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import {
  getGoals,
  saveGoal,
  deleteGoal,
  updateGoalProgress,
  getStreak,
  getQuizStats,
} from "../../services/localStorage";

const GOAL_TYPES = [
  {
    id: "maintain_streak",
    label: "Daily Quiz Streak",
    icon: WhatshotIcon,
    description: "Complete daily quizzes to maintain your streak",
    unit: "days",
    getProgress: () => getStreak().count,
  },
  {
    id: "complete_quizzes",
    label: "Complete Quizzes",
    icon: QuizIcon,
    description: "Test your knowledge with quizzes",
    unit: "quizzes",
    getProgress: () => getQuizStats().completed,
  },
];

/**
 * GoalCard - Display a single goal
 */
function GoalCard({ goal, onDelete, onUpdate }) {
  const goalType = GOAL_TYPES.find((t) => t.id === goal.type);
  const Icon = goalType?.icon || FlagIcon;
  const currentProgress = goalType?.getProgress() || goal.progress;
  const percentage = Math.min(
    100,
    Math.round((currentProgress / goal.target) * 100)
  );
  const isCompleted = currentProgress >= goal.target;

  useEffect(() => {
    if (currentProgress !== goal.progress) {
      onUpdate(goal.id, currentProgress);
    }
  }, [currentProgress, goal.id, goal.progress, onUpdate]);

  const getDeadlineStatus = () => {
    if (!goal.deadline) return null;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: "Expired", color: "error" };
    if (daysLeft === 0) return { label: "Due today!", color: "warning" };
    if (daysLeft <= 3)
      return { label: `${daysLeft} days left`, color: "warning" };
    return { label: `${daysLeft} days left`, color: "default" };
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: isCompleted ? "2px solid #4caf50" : "1px solid #e0e0e0",
        background: isCompleted
          ? "linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(139,195,74,0.05) 100%)"
          : "white",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: isCompleted ? "#4caf50" : "rgba(102,126,234,0.1)",
                color: isCompleted ? "white" : "#667eea",
                display: "flex",
              }}
            >
              {isCompleted ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <Icon fontSize="small" />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {goal.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {goalType?.description}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Delete goal">
            <IconButton
              size="small"
              onClick={() => onDelete(goal.id)}
              sx={{ color: "error.light" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {currentProgress} / {goal.target} {goalType?.unit}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "rgba(0,0,0,0.08)",
              "& .MuiLinearProgress-bar": {
                background: isCompleted
                  ? "#4caf50"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {isCompleted && (
            <Chip label="Completed! 🎉" size="small" color="success" />
          )}
          {deadlineStatus && !isCompleted && (
            <Chip
              label={deadlineStatus.label}
              size="small"
              color={deadlineStatus.color}
              variant="outlined"
            />
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            {percentage}%
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * NewGoalDialog - Create a new goal
 */
function NewGoalDialog({ open, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("maintain_streak");
  const [target, setTarget] = useState(10);
  const [deadline, setDeadline] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      target: parseInt(target),
      deadline: deadline || null,
    });

    // Reset form
    setTitle("");
    setType("maintain_streak");
    setTarget(10);
    setDeadline("");
    onClose();
  };

  const selectedType = GOAL_TYPES.find((t) => t.id === type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlagIcon />
          Set a New Goal
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          autoFocus
          fullWidth
          label="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Explore 20 countries this month"
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Goal Type</InputLabel>
          <Select
            value={type}
            label="Goal Type"
            onChange={(e) => setType(e.target.value)}
          >
            {GOAL_TYPES.map((goalType) => (
              <MenuItem key={goalType.id} value={goalType.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <goalType.icon fontSize="small" />
                  {goalType.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="number"
          label={`Target (${selectedType?.unit})`}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          type="date"
          label="Deadline (optional)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim()}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            },
            "&.Mui-disabled": {
              background: "rgba(0,0,0,0.12)",
              color: "rgba(0,0,0,0.26)",
            },
          }}
        >
          Create Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * GoalTracker - Main goals component
 */
export function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const handleSaveGoal = (goalData) => {
    console.log("Saving goal:", goalData);
    const newGoal = saveGoal(goalData);
    console.log("New goal saved:", newGoal);
    if (newGoal) {
      setGoals(getGoals());
    }
  };

  const handleDeleteGoal = (goalId) => {
    deleteGoal(goalId);
    setGoals(getGoals());
  };

  const handleUpdateProgress = (goalId, progress) => {
    updateGoalProgress(goalId, progress);
    setGoals(getGoals());
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
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
            <FlagIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Learning Goals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set targets and track your progress
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: "white",
            color: "#667eea",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": {
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          New Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No goals set yet. Create your first learning goal to track your
          progress!
        </Alert>
      ) : (
        <Stack spacing={2}>
          {activeGoals.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
              >
                Active Goals ({activeGoals.length})
              </Typography>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onUpdate={handleUpdateProgress}
                />
              ))}
            </>
          )}

          {completedGoals.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
                sx={{ mt: 2 }}
              >
                Completed ({completedGoals.length})
              </Typography>
              {completedGoals.slice(0, 3).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onUpdate={handleUpdateProgress}
                />
              ))}
            </>
          )}
        </Stack>
      )}

      <NewGoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveGoal}
      />
    </Paper>
  );
}

/**
 * GoalSummary - Compact goal display
 */
export function GoalSummary() {
  const goals = getGoals();
  const activeGoals = goals.filter((g) => !g.completed);
  const completedCount = goals.filter((g) => g.completed).length;

  if (goals.length === 0) {
    return null;
  }

  const topGoal = activeGoals[0];

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
        border: "1px solid rgba(102,126,234,0.3)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <FlagIcon sx={{ color: "#667eea" }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Goals: {completedCount}/{goals.length} completed
        </Typography>
      </Box>

      {topGoal && (
        <Box>
          <Typography variant="body2" noWrap>
            {topGoal.title}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (topGoal.progress / topGoal.target) * 100)}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default GoalTracker;
