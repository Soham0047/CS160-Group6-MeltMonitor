// src/theme.js
import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5e9" },
    secondary: { main: "#10b981" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderColor: "#e5e7eb" } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiLink: { styleOverrides: { root: { cursor: "pointer" } } },
  },
});
