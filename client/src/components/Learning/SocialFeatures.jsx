import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Chip,
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import PublicIcon from "@mui/icons-material/Public";
import { getStreak, getQuizStats } from "../../services/localStorage";

/**
 * Generate a shareable URL for a map view
 */
function generateShareUrl(viewState) {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();

  if (viewState.metric) params.set("metric", viewState.metric);
  if (viewState.year) params.set("year", viewState.year);
  if (viewState.selectedCountry)
    params.set("country", viewState.selectedCountry);
  if (viewState.zoom) params.set("zoom", viewState.zoom);

  return `${baseUrl}/map?${params.toString()}`;
}

/**
 * ShareDialog - Dialog to share a view
 */
export function ShareDialog({ open, onClose, viewState, viewName }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl(viewState);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareText = viewName
    ? `Check out "${viewName}" on MeltMonitor - CO₂ emissions data visualization`
    : `Explore CO₂ emissions data on MeltMonitor`;

  const handleSocialShare = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

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
          <ShareIcon />
          Share This View
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Share this data visualization with others:
        </Typography>

        {viewName && (
          <Chip label={viewName} sx={{ mb: 2 }} icon={<LinkIcon />} />
        )}

        {/* URL Copy */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 1.5,
            bgcolor: "rgba(0,0,0,0.05)",
            borderRadius: 2,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={shareUrl}
            InputProps={{ readOnly: true }}
          />
          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <IconButton
              onClick={handleCopy}
              color={copied ? "success" : "default"}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Social Share Buttons */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Share on Social Media
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<TwitterIcon />}
            onClick={() => handleSocialShare("twitter")}
            sx={{ borderColor: "#1DA1F2", color: "#1DA1F2" }}
          >
            Twitter
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkedInIcon />}
            onClick={() => handleSocialShare("linkedin")}
            sx={{ borderColor: "#0A66C2", color: "#0A66C2" }}
          >
            LinkedIn
          </Button>
          <Button
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleSocialShare("facebook")}
            sx={{ borderColor: "#1877F2", color: "#1877F2" }}
          >
            Facebook
          </Button>
        </Stack>

        {/* Current View Info */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            View Details
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Metric: ${viewState.metric === "co2" ? "Total CO₂" : "Per Capita"}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Year: ${viewState.year}`}
              size="small"
              variant="outlined"
            />
            {viewState.selectedCountry && (
              <Chip
                label={`Country: ${viewState.selectedCountry}`}
                size="small"
                color="primary"
              />
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * ShareButton - Button to trigger share dialog
 */
export function ShareButton({ viewState, viewName }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip title="Share this view">
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderColor: "rgba(255,255,255,0.5)",
            color: "white",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Share
        </Button>
      </Tooltip>

      <ShareDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        viewState={viewState}
        viewName={viewName}
      />
    </>
  );
}

/**
 * Leaderboard - Display user rankings (mock data for now)
 */
export function Leaderboard() {
  // Mock leaderboard data - would come from backend
  const leaderboardData = [
    {
      rank: 1,
      name: "ClimateChampion",
      streak: 45,
      quizzes: 32,
      perfectScores: 15,
    },
    {
      rank: 2,
      name: "EcoExplorer",
      streak: 38,
      quizzes: 28,
      perfectScores: 12,
    },
    {
      rank: 3,
      name: "GreenLearner",
      streak: 30,
      quizzes: 25,
      perfectScores: 10,
    },
    { rank: 4, name: "DataDiver", streak: 25, quizzes: 20, perfectScores: 8 },
    {
      rank: 5,
      name: "EarthWatcher",
      streak: 21,
      quizzes: 18,
      perfectScores: 6,
    },
  ];

  // Get current user stats
  const userStats = {
    streak: getStreak().count,
    quizzes: getQuizStats().completed,
    perfectScores: getQuizStats().perfectScores || 0,
  };

  // Calculate user's potential rank based on quiz streak
  const userRank = leaderboardData.findIndex(
    (entry) =>
      userStats.streak > entry.streak ||
      (userStats.streak === entry.streak && userStats.quizzes > entry.quizzes)
  );

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
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #ffd700 0%, #ff9800 100%)",
            color: "white",
          }}
        >
          <LeaderboardIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Leaderboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top climate learners this month
          </Typography>
        </Box>
      </Box>

      <List sx={{ mb: 2 }}>
        {leaderboardData.map((entry, index) => (
          <ListItem
            key={entry.rank}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor:
                index === 0
                  ? "rgba(255, 215, 0, 0.1)"
                  : index === 1
                    ? "rgba(192, 192, 192, 0.1)"
                    : index === 2
                      ? "rgba(205, 127, 50, 0.1)"
                      : "transparent",
              border:
                index < 3
                  ? `1px solid ${index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : "#cd7f32"}`
                  : "1px solid transparent",
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                        ? "#c0c0c0"
                        : index === 2
                          ? "#cd7f32"
                          : "#667eea",
                  fontWeight: 700,
                }}
              >
                {entry.rank}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontWeight={600}>{entry.name}</Typography>
                  {index === 0 && (
                    <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 18 }} />
                  )}
                </Box>
              }
              secondary={
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip
                    icon={<WhatshotIcon />}
                    label={`${entry.streak}d`}
                    size="small"
                    sx={{ height: 22, fontSize: 11 }}
                  />
                  <Chip
                    icon={<PublicIcon />}
                    label={entry.explored}
                    size="small"
                    sx={{ height: 22, fontSize: 11 }}
                  />
                </Stack>
              }
              secondaryTypographyProps={{ component: "div" }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Your Stats */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "rgba(102, 126, 234, 0.1)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Your Stats
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Streak
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {userStats.streak} days
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Quizzes
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {userStats.quizzes}
            </Typography>
          </Box>
        </Stack>
        {userRank >= 0 && userRank < 5 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You could be ranked #{userRank + 1} on the leaderboard!
          </Alert>
        )}
      </Box>
    </Paper>
  );
}

/**
 * DiscussionNotes - Community notes on a country (placeholder)
 */
export function DiscussionNotes({ countryCode }) {
  const [notes] = useState([
    {
      id: 1,
      author: "ClimateWatcher",
      text: "Interesting to see how emissions have changed since the Paris Agreement",
      timestamp: "2 hours ago",
      likes: 12,
    },
    {
      id: 2,
      author: "DataAnalyst",
      text: "The per-capita trend is particularly noteworthy here",
      timestamp: "5 hours ago",
      likes: 8,
    },
  ]);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background: "rgba(255,255,255,0.95)",
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Community Insights
      </Typography>
      <Typography variant="caption" color="text.secondary" paragraph>
        Notes from other learners about this country
      </Typography>

      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No community notes yet. Be the first to add one!
        </Typography>
      ) : (
        <Stack spacing={1}>
          {notes.map((note) => (
            <Paper
              key={note.id}
              variant="outlined"
              sx={{ p: 1.5, borderRadius: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {note.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {note.timestamp}
                </Typography>
              </Box>
              <Typography variant="body2">{note.text}</Typography>
            </Paper>
          ))}
        </Stack>
      )}

      <Button size="small" sx={{ mt: 1 }}>
        Add Note (Coming Soon)
      </Button>
    </Paper>
  );
}

export default ShareDialog;
