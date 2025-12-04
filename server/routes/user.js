const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// ============ PREFERENCES ============

/**
 * GET /api/user/preferences
 * Get user preferences
 */
router.get("/preferences", (req, res) => {
  try {
    const db = getDB();
    const prefs = db
      .prepare("SELECT * FROM preferences WHERE userId = ?")
      .get(req.userId);

    res.json({
      preferences: prefs || {
        homeCountry: "",
        theme: "system",
        units: "metric",
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ error: "Failed to get preferences." });
  }
});

/**
 * PATCH /api/user/preferences
 * Update user preferences
 */
router.patch("/preferences", (req, res) => {
  try {
    const db = getDB();
    const { homeCountry, theme, units } = req.body;

    // Check if preferences exist
    const existing = db
      .prepare("SELECT * FROM preferences WHERE userId = ?")
      .get(req.userId);

    if (existing) {
      db.prepare(
        `UPDATE preferences SET 
         homeCountry = COALESCE(?, homeCountry),
         theme = COALESCE(?, theme),
         units = COALESCE(?, units)
         WHERE userId = ?`
      ).run(homeCountry, theme, units, req.userId);
    } else {
      db.prepare(
        "INSERT INTO preferences (userId, homeCountry, theme, units) VALUES (?, ?, ?, ?)"
      ).run(
        req.userId,
        homeCountry || "",
        theme || "system",
        units || "metric"
      );
    }

    const updated = db
      .prepare("SELECT * FROM preferences WHERE userId = ?")
      .get(req.userId);

    res.json({
      message: "Preferences updated.",
      preferences: updated,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences." });
  }
});

// ============ SAVED VIEWS ============

/**
 * GET /api/user/views
 * Get all saved views
 */
router.get("/views", (req, res) => {
  try {
    const db = getDB();
    const views = db
      .prepare(
        "SELECT * FROM saved_views WHERE userId = ? ORDER BY createdAt DESC"
      )
      .all(req.userId);

    // Parse countries JSON
    const parsedViews = views.map((v) => ({
      ...v,
      countries: JSON.parse(v.countries || "[]"),
    }));

    res.json({ views: parsedViews });
  } catch (error) {
    console.error("Get views error:", error);
    res.status(500).json({ error: "Failed to get saved views." });
  }
});

/**
 * POST /api/user/views
 * Create a new saved view
 */
router.post("/views", (req, res) => {
  try {
    const db = getDB();
    const { name, countries, metric, dateRange } = req.body;

    if (!name) {
      return res.status(400).json({ error: "View name is required." });
    }

    const result = db
      .prepare(
        "INSERT INTO saved_views (userId, name, countries, metric, dateRange) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        req.userId,
        name,
        JSON.stringify(countries || []),
        metric || "co2",
        dateRange || ""
      );

    const newView = db
      .prepare("SELECT * FROM saved_views WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "View saved.",
      view: { ...newView, countries: JSON.parse(newView.countries || "[]") },
    });
  } catch (error) {
    console.error("Create view error:", error);
    res.status(500).json({ error: "Failed to save view." });
  }
});

/**
 * DELETE /api/user/views/:viewId
 * Delete a saved view
 */
router.delete("/views/:viewId", (req, res) => {
  try {
    const db = getDB();
    const { viewId } = req.params;

    db.prepare("DELETE FROM saved_views WHERE id = ? AND userId = ?").run(
      viewId,
      req.userId
    );

    res.json({ message: "View deleted." });
  } catch (error) {
    console.error("Delete view error:", error);
    res.status(500).json({ error: "Failed to delete view." });
  }
});

// ============ STREAK ============

/**
 * GET /api/user/streak
 * Get streak data
 */
router.get("/streak", (req, res) => {
  try {
    const db = getDB();
    const streak = db
      .prepare("SELECT * FROM streaks WHERE userId = ?")
      .get(req.userId);

    res.json({
      streak: streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastActive: "",
        totalDaysActive: 0,
      },
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ error: "Failed to get streak." });
  }
});

/**
 * POST /api/user/streak/record
 * Record activity (call when user interacts with map)
 */
router.post("/streak/record", (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split("T")[0];

    const streak = db
      .prepare("SELECT * FROM streaks WHERE userId = ?")
      .get(req.userId);

    if (!streak) {
      db.prepare(
        "INSERT INTO streaks (userId, currentStreak, longestStreak, lastActive, totalDaysActive) VALUES (?, 1, 1, ?, 1)"
      ).run(req.userId, today);
    } else if (streak.lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      let newStreak = 1;
      if (streak.lastActive === yesterday) {
        newStreak = streak.currentStreak + 1;
      }

      db.prepare(
        `UPDATE streaks SET 
         currentStreak = ?, 
         longestStreak = MAX(longestStreak, ?),
         lastActive = ?,
         totalDaysActive = totalDaysActive + 1
         WHERE userId = ?`
      ).run(newStreak, newStreak, today, req.userId);
    }

    const updated = db
      .prepare("SELECT * FROM streaks WHERE userId = ?")
      .get(req.userId);

    res.json({ streak: updated });
  } catch (error) {
    console.error("Record streak error:", error);
    res.status(500).json({ error: "Failed to record activity." });
  }
});

// ============ EXPLORED COUNTRIES ============

/**
 * GET /api/user/explored
 * Get explored countries
 */
router.get("/explored", (req, res) => {
  try {
    const db = getDB();
    const rows = db
      .prepare("SELECT countryCode FROM explored_countries WHERE userId = ?")
      .all(req.userId);

    const countries = rows.map((r) => r.countryCode);

    res.json({
      countries,
      count: countries.length,
    });
  } catch (error) {
    console.error("Get explored error:", error);
    res.status(500).json({ error: "Failed to get explored countries." });
  }
});

/**
 * POST /api/user/explored/:iso3
 * Mark a country as explored
 */
router.post("/explored/:iso3", (req, res) => {
  try {
    const db = getDB();
    const { iso3 } = req.params;

    try {
      db.prepare(
        "INSERT INTO explored_countries (userId, countryCode) VALUES (?, ?)"
      ).run(req.userId, iso3);
    } catch (e) {
      // Ignore duplicate error
    }

    const rows = db
      .prepare("SELECT countryCode FROM explored_countries WHERE userId = ?")
      .all(req.userId);

    res.json({
      message: "Country marked as explored.",
      countries: rows.map((r) => r.countryCode),
    });
  } catch (error) {
    console.error("Mark explored error:", error);
    res.status(500).json({ error: "Failed to mark country explored." });
  }
});

// ============ QUIZ STATS ============

/**
 * GET /api/user/quiz-stats
 * Get quiz statistics
 */
router.get("/quiz-stats", (req, res) => {
  try {
    const db = getDB();
    const stats = db
      .prepare("SELECT * FROM quiz_stats WHERE userId = ?")
      .get(req.userId);

    res.json({
      quizStats: stats || {
        completed: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        streak: 0,
        bestStreak: 0,
      },
    });
  } catch (error) {
    console.error("Get quiz stats error:", error);
    res.status(500).json({ error: "Failed to get quiz stats." });
  }
});

/**
 * POST /api/user/quiz-stats
 * Update quiz statistics after completing a quiz
 */
router.post("/quiz-stats", (req, res) => {
  try {
    const db = getDB();
    const { correct, total, newStreak } = req.body;

    const existing = db
      .prepare("SELECT * FROM quiz_stats WHERE userId = ?")
      .get(req.userId);

    if (existing) {
      db.prepare(
        `UPDATE quiz_stats SET 
         completed = completed + 1,
         totalCorrect = totalCorrect + ?,
         totalQuestions = totalQuestions + ?,
         streak = ?,
         bestStreak = MAX(bestStreak, ?)
         WHERE userId = ?`
      ).run(correct, total, newStreak, newStreak, req.userId);
    } else {
      db.prepare(
        "INSERT INTO quiz_stats (userId, completed, totalCorrect, totalQuestions, streak, bestStreak) VALUES (?, 1, ?, ?, ?, ?)"
      ).run(req.userId, correct, total, newStreak, newStreak);
    }

    const updated = db
      .prepare("SELECT * FROM quiz_stats WHERE userId = ?")
      .get(req.userId);

    res.json({ quizStats: updated });
  } catch (error) {
    console.error("Update quiz stats error:", error);
    res.status(500).json({ error: "Failed to update quiz stats." });
  }
});

// ============ BADGES ============

/**
 * GET /api/user/badges
 * Get earned badges
 */
router.get("/badges", (req, res) => {
  try {
    const db = getDB();
    const badges = db
      .prepare("SELECT * FROM badges WHERE userId = ? ORDER BY earnedAt DESC")
      .all(req.userId);

    res.json({ badges });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ error: "Failed to get badges." });
  }
});

/**
 * POST /api/user/badges
 * Award a badge
 */
router.post("/badges", (req, res) => {
  try {
    const db = getDB();
    const { badgeId, title, description } = req.body;

    // Check if already earned
    const existing = db
      .prepare("SELECT * FROM badges WHERE userId = ? AND badgeId = ?")
      .get(req.userId, badgeId);

    if (existing) {
      return res.json({ message: "Badge already earned.", badge: existing });
    }

    const result = db
      .prepare(
        "INSERT INTO badges (userId, badgeId, title, description) VALUES (?, ?, ?, ?)"
      )
      .run(req.userId, badgeId, title, description || "");

    const newBadge = db
      .prepare("SELECT * FROM badges WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({ message: "Badge awarded!", badge: newBadge });
  } catch (error) {
    console.error("Award badge error:", error);
    res.status(500).json({ error: "Failed to award badge." });
  }
});

// ============ GOALS ============

/**
 * GET /api/user/goals
 * Get all goals
 */
router.get("/goals", (req, res) => {
  try {
    const db = getDB();
    const goals = db
      .prepare("SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC")
      .all(req.userId);

    res.json({ goals });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ error: "Failed to get goals." });
  }
});

/**
 * POST /api/user/goals
 * Create a new goal
 */
router.post("/goals", (req, res) => {
  try {
    const db = getDB();
    const { title, description, target, current, deadline, type } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Goal title is required." });
    }

    const result = db
      .prepare(
        "INSERT INTO goals (userId, title, description, target, current, deadline, type) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        req.userId,
        title,
        description || "",
        target || 0,
        current || 0,
        deadline || "",
        type || "custom"
      );

    const newGoal = db
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({ message: "Goal created.", goal: newGoal });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ error: "Failed to create goal." });
  }
});

/**
 * PATCH /api/user/goals/:goalId
 * Update goal progress
 */
router.patch("/goals/:goalId", (req, res) => {
  try {
    const db = getDB();
    const { goalId } = req.params;
    const { current, completed } = req.body;

    db.prepare(
      `UPDATE goals SET 
       current = COALESCE(?, current),
       completed = COALESCE(?, completed)
       WHERE id = ? AND userId = ?`
    ).run(current, completed ? 1 : 0, goalId, req.userId);

    const updated = db.prepare("SELECT * FROM goals WHERE id = ?").get(goalId);

    res.json({ message: "Goal updated.", goal: updated });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ error: "Failed to update goal." });
  }
});

/**
 * DELETE /api/user/goals/:goalId
 * Delete a goal
 */
router.delete("/goals/:goalId", (req, res) => {
  try {
    const db = getDB();
    const { goalId } = req.params;

    db.prepare("DELETE FROM goals WHERE id = ? AND userId = ?").run(
      goalId,
      req.userId
    );

    res.json({ message: "Goal deleted." });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Failed to delete goal." });
  }
});

// ============ EXPORT ============

/**
 * GET /api/user/export
 * Export all user data
 */
router.get("/export", (req, res) => {
  try {
    const db = getDB();

    const user = db
      .prepare("SELECT id, email, createdAt FROM users WHERE id = ?")
      .get(req.userId);
    const prefs = db
      .prepare("SELECT * FROM preferences WHERE userId = ?")
      .get(req.userId);
    const views = db
      .prepare("SELECT * FROM saved_views WHERE userId = ?")
      .all(req.userId);
    const streak = db
      .prepare("SELECT * FROM streaks WHERE userId = ?")
      .get(req.userId);
    const explored = db
      .prepare("SELECT countryCode FROM explored_countries WHERE userId = ?")
      .all(req.userId);

    res.json({
      email: user?.email,
      preferences: prefs,
      savedViews: views.map((v) => ({
        ...v,
        countries: JSON.parse(v.countries || "[]"),
      })),
      streak,
      exploredCountries: explored.map((r) => r.countryCode),
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data." });
  }
});

module.exports = router;
