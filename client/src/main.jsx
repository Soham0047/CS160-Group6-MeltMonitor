// src/main.jsx
import React, { useMemo, useState, createContext } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

// Optional: keep font defaults consistent across the app
const fontStack = `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;

// Expose a context so TopBar (or any component) can toggle color mode
export const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

function Root() {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0ea5e9" },
          secondary: { main: "#10b981" },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: fontStack,
          h6: { fontWeight: 700 },
          subtitle2: { fontWeight: 600 },
        },
        components: {
          MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
