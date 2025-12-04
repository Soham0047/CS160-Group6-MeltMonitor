const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "meltmonitor-dev-secret";

/**
 * Auth middleware - validates JWT token
 * Attaches userId to req.userId if valid
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check user exists in database
    const db = getDB();
    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // Attach userId to request
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Server error during authentication." });
  }
};

/**
 * Optional auth - doesn't fail if no token, but attaches userId if valid
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const db = getDB();
    const user = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(decoded.userId);

    if (user) {
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Token invalid but continue anyway
    next();
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

module.exports = { auth, optionalAuth, generateToken };
