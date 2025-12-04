// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

console.log("🚀 main.jsx loaded - MeltMonitor starting...");

const theme = createTheme({
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
    MuiAppBar: { styleOverrides: { root: { borderRadius: 0 } } },
  },
});

function Root() {
  console.log("🎨 Root component rendering...");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

console.log("✅ main.jsx initialization complete");
