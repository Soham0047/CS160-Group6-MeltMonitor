import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link as MUILink,
  Button,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import SchoolIcon from "@mui/icons-material/School";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NavItem = ({ to, icon, label, active }) => (
  <MUILink
    component={RouterLink}
    to={to}
    underline="none"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2.5,
      py: 1,
      borderRadius: 3,
      color: active ? "white" : "rgba(255,255,255,0.7)",
      background: active
        ? "linear-gradient(135deg, #667eea, #764ba2)"
        : "transparent",
      fontWeight: 600,
      fontSize: 15,
      transition: "all 0.3s ease",
      "&:hover": {
        background: active
          ? "linear-gradient(135deg, #5568d3, #65408a)"
          : "rgba(255,255,255,0.1)",
        color: "white",
        transform: "translateY(-2px)",
      },
    }}
  >
    {icon} {label}
  </MUILink>
);

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOnline, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        borderRadius: 0,
        m: 0,
        left: 0,
        right: 0,
        width: "100%",
        "&:before": { display: "none" },
      }}
    >
      <Toolbar disableGutters sx={{ gap: 3, py: 1, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🌍
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            MeltMonitor
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <NavItem
          to="/"
          icon={<DashboardIcon fontSize="small" />}
          label="Dashboard"
          active={pathname === "/"}
        />
        <NavItem
          to="/map"
          icon={<MapIcon fontSize="small" />}
          label="Map"
          active={pathname.startsWith("/map")}
        />
        <NavItem
          to="/learn"
          icon={<SchoolIcon fontSize="small" />}
          label="Learn"
          active={pathname.startsWith("/learn")}
        />
        <NavItem
          to="/profile"
          icon={<AccountCircle fontSize="small" />}
          label="Profile"
          active={pathname.startsWith("/profile")}
        />
        <NavItem
          to="/sources"
          icon={<InfoOutlined fontSize="small" />}
          label="Sources"
          active={pathname.startsWith("/sources")}
        />

        {/* Auth Status - improved UI */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}>
          {!isOnline && (
            <Chip
              label="⚡ Offline"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
              }}
            />
          )}

          {!loading &&
            (isAuthenticated ? (
              <Tooltip title={`Sign out (${user?.email})`} arrow>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  size="small"
                  startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    fontWeight: 600,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  LOGOUT
                </Button>
              </Tooltip>
            ) : (
              <Button
                component={RouterLink}
                to="/auth"
                variant="contained"
                size="small"
                startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Sign In
              </Button>
            ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
