import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link as MUILink,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink, useLocation } from "react-router-dom";

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
          to="/sources"
          icon={<InfoOutlined fontSize="small" />}
          label="Sources"
          active={pathname.startsWith("/sources")}
        />
      </Toolbar>
    </AppBar>
  );
}
