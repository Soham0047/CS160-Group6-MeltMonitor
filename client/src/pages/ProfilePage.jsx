import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Fade,
  Button,
  Alert,
  Chip,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import SettingsIcon from "@mui/icons-material/Settings";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import LogoutIcon from "@mui/icons-material/Logout";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import { StreakCard } from "../components/Learning/StudyStreak";
import { SavedViewsList } from "../components/Learning/SavedViews";
import {
  HomeCountryCard,
  HomeCountrySelector,
} from "../components/Learning/HomeCountry";
import { useAuth } from "../contexts/AuthContext";

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

/**
 * AccountCard - Shows user account info and logout
 */
function AccountCard() {
  const { user, logout, isOnline } = useAuth();

  const getAuthProviderInfo = () => {
    if (user?.authProvider === "google") {
      return { icon: <GoogleIcon />, label: "Google Account" };
    } else if (user?.authProvider === "both") {
      return { icon: <GoogleIcon />, label: "Google + Email" };
    }
    return { icon: <EmailIcon />, label: "Email Account" };
  };

  const providerInfo = getAuthProviderInfo();

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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          src={user?.avatar}
          sx={{
            width: 64,
            height: 64,
            bgcolor: "#667eea",
            fontSize: "1.5rem",
          }}
        >
          {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {user?.name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Chip
            icon={providerInfo.icon}
            label={providerInfo.label}
            size="small"
            sx={{ mt: 0.5, fontSize: "0.7rem" }}
          />
        </Box>
      </Box>

      {/* Status */}
      <Alert
        severity={isOnline ? "success" : "warning"}
        icon={isOnline ? <CloudIcon /> : <CloudOffIcon />}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        {isOnline
          ? "Your data is synced across devices"
          : "You're offline. Changes will sync when connected."}
      </Alert>

      {/* Logout Button */}
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={logout}
        fullWidth
        sx={{
          borderRadius: 2,
          py: 1,
          fontWeight: 600,
        }}
      >
        Sign Out
      </Button>
    </Paper>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isOnline, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleLoadView = (view) => {
    // Navigate to map with saved view state
    navigate("/map", {
      state: {
        metric: view.metric,
        year: view.year,
        selectedCountry: view.selectedCountry,
      },
    });
  };

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
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  border: "3px solid rgba(255,255,255,0.3)",
                }}
              >
                {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || (
                  <PersonIcon sx={{ fontSize: 32 }} />
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  {user?.name || "My Profile"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <Chip
                icon={isOnline ? <CloudIcon /> : <CloudOffIcon />}
                label={isOnline ? "Synced" : "Offline"}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            </Box>
          </Container>
        </Box>
      </Fade>

      <Container maxWidth="lg">
        {/* Tabs */}
        <Paper
          sx={{
            borderRadius: 3,
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
              },
              "& .Mui-selected": {
                color: "#667eea",
              },
              "& .MuiTabs-indicator": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: 3,
              },
            }}
          >
            <Tab
              icon={<WhatshotIcon />}
              iconPosition="start"
              label="Overview"
            />
            <Tab
              icon={<BookmarkIcon />}
              iconPosition="start"
              label="Saved Views"
            />
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="Settings"
            />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StreakCard />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <HomeCountryCard />
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Paper
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  onClick={() => navigate("/map")}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Typography variant="h4">🗺️</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Explore Map
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  onClick={() => navigate("/")}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Typography variant="h4">📊</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Dashboard
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                  onClick={() => navigate("/sources")}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Typography variant="h4">📚</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Data Sources
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Saved Views Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Saved Views
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Quickly return to interesting data states you've bookmarked.
          </Typography>
          <SavedViewsList onLoadView={handleLoadView} />
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AccountCard />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <HomeCountrySelector />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Your Data
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your data is securely stored in your account and syncs across
                  all your devices.
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Chip
                    label="✓ Saved views and preferences"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                    }}
                  />
                  <Chip
                    label="✓ Learning streak and progress"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                    }}
                  />
                  <Chip
                    label="✓ Countries you've explored"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                    }}
                  />
                  <Chip
                    label="✓ Quiz scores and badges"
                    size="small"
                    sx={{
                      justifyContent: "flex-start",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
}
