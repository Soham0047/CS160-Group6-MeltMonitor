const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const { getDB } = require("../config/db");
const { generateToken, auth } = require("../middleware/auth");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * POST /api/auth/register
 * Register a new user with email/password
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const db = getDB();

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
        code: "MISSING_FIELDS",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
        code: "WEAK_PASSWORD",
      });
    }

    // Check if user exists
    const existingUser = db
      .prepare("SELECT id, authProvider FROM users WHERE email = ?")
      .get(email.toLowerCase());

    if (existingUser) {
      // If user exists with Google, allow linking
      if (existingUser.authProvider === "google") {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(
          `UPDATE users SET 
           password = ?, 
           name = COALESCE(NULLIF(name, ''), ?),
           authProvider = 'both' 
           WHERE id = ?`
        ).run(hashedPassword, name || "", existingUser.id);

        const token = generateToken(existingUser.id);
        const user = db
          .prepare("SELECT id, email, name, avatar FROM users WHERE id = ?")
          .get(existingUser.id);

        return res.status(200).json({
          message: "Password added to your Google account!",
          token,
          user,
        });
      }

      return res.status(400).json({
        error: "An account with this email already exists.",
        code: "EMAIL_EXISTS",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = db
      .prepare(
        "INSERT INTO users (email, password, name, authProvider) VALUES (?, ?, ?, 'local')"
      )
      .run(email.toLowerCase(), hashedPassword, name || "");

    const userId = result.lastInsertRowid;

    // Initialize preferences and streak for the user
    db.prepare("INSERT INTO preferences (userId) VALUES (?)").run(userId);
    db.prepare("INSERT INTO streaks (userId) VALUES (?)").run(userId);

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: userId, email: email.toLowerCase(), name: name || "" },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Failed to create account. Please try again.",
      code: "SERVER_ERROR",
    });
  }
});

/**
 * POST /api/auth/login
 * Login user with email/password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
        code: "MISSING_FIELDS",
      });
    }

    // Find user
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check if user has a password (might be Google-only user)
    if (!user.password) {
      return res.status(401).json({
        error: "This account uses Google Sign-In. Please sign in with Google.",
        code: "GOOGLE_ONLY",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update streak
    updateUserStreak(db, user.id);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed. Please try again.",
      code: "SERVER_ERROR",
    });
  }
});

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get("/google", (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: "Google Sign-In is not configured. Please use email/password login.",
      code: "GOOGLE_NOT_CONFIGURED",
    });
  }
  
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get("/google/callback", (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${CLIENT_URL}/auth?error=google_not_configured`);
  }

  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/auth?error=google_failed`,
    session: true,
  })(req, res, (err) => {
    if (err) {
      console.error("Google auth error:", err);
      return res.redirect(`${CLIENT_URL}/auth?error=google_failed`);
    }
    
    try {
      const db = getDB();

      // Update streak on login
      updateUserStreak(db, req.user.id);

      // Generate JWT token for client-side auth
      const token = generateToken(req.user.id);

      // Redirect to client with token
      res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${CLIENT_URL}/auth?error=callback_failed`);
    }
  });
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get("/me", auth, (req, res) => {
  try {
    const db = getDB();
    const user = db
      .prepare(
        "SELECT id, email, name, avatar, authProvider, createdAt FROM users WHERE id = ?"
      )
      .get(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user data." });
  }
});

/**
 * POST /api/auth/logout
 * Logout (clear session and client-side token)
 */
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      res.json({ message: "Logged out successfully." });
    });
  });
});

/**
 * GET /api/auth/session
 * Check if user has an active session (for OAuth)
 */
router.get("/session", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const token = generateToken(req.user.id);
    res.json({
      authenticated: true,
      token,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name || "",
        avatar: req.user.avatar || "",
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

/**
 * Helper: Update user streak
 */
function updateUserStreak(db, userId) {
  const today = new Date().toISOString().split("T")[0];
  const streak = db
    .prepare("SELECT * FROM streaks WHERE userId = ?")
    .get(userId);

  if (streak) {
    const lastActive = streak.lastActive || "";
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    let newStreak = streak.currentStreak;
    if (lastActive !== today) {
      if (lastActive === yesterday) {
        newStreak = streak.currentStreak + 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }

      db.prepare(
        `UPDATE streaks SET 
         currentStreak = ?, 
         longestStreak = MAX(longestStreak, ?),
         lastActive = ?,
         totalDaysActive = totalDaysActive + 1
         WHERE userId = ?`
      ).run(newStreak, newStreak, today, userId);
    }
  }
}

module.exports = router;
