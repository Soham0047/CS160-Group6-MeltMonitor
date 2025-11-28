// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // anything starting with /wb will be proxied
      "/wb": {
        target: "https://api.worldbank.org",
        changeOrigin: true, // set Host header to target
        secure: true, // WB uses https
        rewrite: (path) => path.replace(/^\/wb/, ""), // /wb/v2/... -> /v2/...
      },
    },
  },
});
