import { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link as MUILink,
  IconButton,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { ColorModeContext } from "../../main"; // <-- relative to this file

const NavItem = ({ to, icon, label, active }) => (
  <MUILink
    component={RouterLink}
    to={to}
    underline="hover"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.75,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      color: active ? "primary.main" : "text.primary",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    {icon} {label}
  </MUILink>
);

export default function TopBar() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { pathname } = useLocation();

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      enableColorOnDark
      sx={{
        backdropFilter: "blur(8px)",
        bgcolor: (t) =>
          mode === "light" ? "rgba(255,255,255,0.75)" : "rgba(20,20,20,0.65)",
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          MeltMonitor
        </Typography>
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
        <Box sx={{ width: 8 }} />
        <Tooltip
          title={
            mode === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          <IconButton
            size="small"
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
