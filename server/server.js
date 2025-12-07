const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { initDB } = require("./config/db");
const { configurePassport } = require("./config/passport");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// ============ MIDDLEWARE ============

// CORS - allow client requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Session middleware for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "meltmonitor-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============ ROUTES ============

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "MeltMonitor API Server",
    version: "1.0.0",
    database: "SQLite",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/google",
      "GET /api/auth/google/callback",
      "GET /api/auth/me",
      "GET /api/user/preferences",
      "PATCH /api/user/preferences",
      "GET /api/user/views",
      "POST /api/user/views",
      "DELETE /api/user/views/:id",
      "GET /api/user/streak",
      "POST /api/user/streak/record",
      "GET /api/user/explored",
    ],
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3001;

const startServer = () => {
  try {
    // Initialize SQLite database
    initDB();

    // Configure Passport after DB is initialized
    configurePassport();

    app.listen(PORT, () => {
      console.log(`
🌍 MeltMonitor API Server
━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:   http://localhost:${PORT}
📊 Status:   Running
💾 Database: SQLite (data.db)
━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
