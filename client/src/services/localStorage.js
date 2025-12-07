// localStorage utilities for personalized learning features
// Handles saved views, preferences, streak tracking, etc.
// Data is isolated per user using user ID prefixes

// Base storage key names (will be prefixed with user ID)
const BASE_KEYS = {
  SAVED_VIEWS: "saved_views",
  HOME_COUNTRY: "home_country",
  PREFERENCES: "preferences",
  STREAK: "streak",
  QUIZ_STATS: "quiz_stats",
  BADGES: "badges",
  GOALS: "goals",
  CARBON_FOOTPRINT: "carbon_footprint",
  DAILY_QUIZ_REMINDER: "daily_quiz_reminder",
  AI_CHAT_STATS: "ai_chat_stats",
};

// Get current user ID from cached user data
function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem("meltmonitor_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Get user-specific storage key
function getUserKey(baseKey) {
  const userId = getCurrentUserId();
  if (userId) {
    return `meltmonitor_u${userId}_${baseKey}`;
  }
  // Fallback for anonymous/not-logged-in users
  return `meltmonitor_anon_${baseKey}`;
}

// Dynamic STORAGE_KEYS that returns user-specific keys
const STORAGE_KEYS = new Proxy(BASE_KEYS, {
  get(target, prop) {
    if (prop in target) {
      return getUserKey(target[prop]);
    }
    return undefined;
  },
});

// ============ SAVED VIEWS ============

/**
 * Get all saved views
 * @returns {Array} Array of saved view objects
 */
export function getSavedViews() {
  try {
    const views = localStorage.getItem(STORAGE_KEYS.SAVED_VIEWS);
    return views ? JSON.parse(views) : [];
  } catch (e) {
    console.error("Error reading saved views:", e);
    return [];
  }
}

/**
 * Save a new view
 * @param {Object} view - { name, metric, year, selectedCountry, createdAt }
 * @returns {Object} The saved view with generated ID
 */
export function saveView(view) {
  try {
    const views = getSavedViews();
    const newView = {
      ...view,
      id: `view_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    views.push(newView);
    localStorage.setItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(views));
    return newView;
  } catch (e) {
    console.error("Error saving view:", e);
    return null;
  }
}

/**
 * Delete a saved view
 * @param {string} viewId - The view ID to delete
 */
export function deleteView(viewId) {
  try {
    const views = getSavedViews();
    const filtered = views.filter((v) => v.id !== viewId);
    localStorage.setItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting view:", e);
  }
}

/**
 * Update a saved view (e.g., add reflection note)
 * @param {string} viewId - The view ID to update
 * @param {Object} updates - Fields to update
 */
export function updateView(viewId, updates) {
  try {
    const views = getSavedViews();
    const index = views.findIndex((v) => v.id === viewId);
    if (index !== -1) {
      views[index] = {
        ...views[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(views));
      return views[index];
    }
    return null;
  } catch (e) {
    console.error("Error updating view:", e);
    return null;
  }
}

// ============ HOME COUNTRY ============

/**
 * Get user's home country preference
 * @returns {Object|null} { iso3, name, defaultMetric, defaultYear }
 */
export function getHomeCountry() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOME_COUNTRY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading home country:", e);
    return null;
  }
}

/**
 * Set user's home country
 * @param {Object} country - { iso3, name, defaultMetric?, defaultYear? }
 */
export function setHomeCountry(country) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOME_COUNTRY, JSON.stringify(country));
  } catch (e) {
    console.error("Error saving home country:", e);
  }
}

// ============ USER PREFERENCES ============

/**
 * Get all user preferences
 * @returns {Object} User preferences
 */
export function getPreferences() {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return prefs
      ? JSON.parse(prefs)
      : {
          defaultMetric: "co2",
          defaultYear: 2024,
          temperatureUnit: "C",
          showTutorial: true,
        };
  } catch (e) {
    console.error("Error reading preferences:", e);
    return {};
  }
}

/**
 * Update user preferences
 * @param {Object} updates - Preference fields to update
 */
export function updatePreferences(updates) {
  try {
    const current = getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error updating preferences:", e);
    return null;
  }
}

// ============ STUDY STREAK (Based on Daily Quiz) ============

/**
 * Get current streak data
 * @returns {Object} { count, lastQuizDate, longestStreak }
 */
export function getStreak() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK);
    return data
      ? JSON.parse(data)
      : { count: 0, lastQuizDate: null, longestStreak: 0 };
  } catch (e) {
    console.error("Error reading streak:", e);
    return { count: 0, lastQuizDate: null, longestStreak: 0 };
  }
}

/**
 * Record quiz completion for streak tracking
 * Call this when user completes a daily quiz
 * @returns {Object} Updated streak data with streakUpdated flag
 */
export function recordDailyQuiz() {
  try {
    const streak = getStreak();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastQuiz = streak.lastQuizDate;

    // If already completed quiz today, no streak change
    if (lastQuiz === today) {
      return { ...streak, streakUpdated: false, alreadyCompleted: true };
    }

    // Check if last quiz was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newCount;
    if (lastQuiz === yesterdayStr) {
      // Consecutive day - increment streak
      newCount = streak.count + 1;
    } else {
      // Gap in activity - reset streak to 1
      newCount = 1;
    }

    const updated = {
      count: newCount,
      lastQuizDate: today,
      longestStreak: Math.max(streak.longestStreak, newCount),
      streakUpdated: true,
      alreadyCompleted: false,
    };

    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error recording daily quiz:", e);
    return {
      count: 0,
      lastQuizDate: null,
      longestStreak: 0,
      streakUpdated: false,
    };
  }
}

/**
 * Check if user has completed today's daily quiz
 * @returns {boolean}
 */
export function hasCompletedDailyQuiz() {
  const streak = getStreak();
  const today = new Date().toISOString().split("T")[0];
  return streak.lastQuizDate === today;
}

/**
 * Check if streak is at risk (no quiz yesterday and none today yet)
 * @returns {Object} { atRisk, daysLeft, lastQuizDate }
 */
export function getStreakStatus() {
  const streak = getStreak();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Already completed today
  if (streak.lastQuizDate === today) {
    return { atRisk: false, completed: true, streak: streak.count };
  }

  // Completed yesterday - streak is safe but needs today's quiz
  if (streak.lastQuizDate === yesterdayStr) {
    return {
      atRisk: true,
      completed: false,
      streak: streak.count,
      message: "Complete today's quiz to keep your streak!",
    };
  }

  // Streak is broken or never started
  return {
    atRisk: false,
    completed: false,
    streak: 0,
    message: "Start a new streak with today's quiz!",
  };
}

// Legacy function for backward compatibility - now calls recordDailyQuiz
export function recordActivity() {
  return recordDailyQuiz();
}

// ============ CLEAR ALL DATA ============

/**
 * Clear all personalization data for the current user
 */
export function clearAllData() {
  Object.values(BASE_KEYS).forEach((baseKey) => {
    const userKey = getUserKey(baseKey);
    localStorage.removeItem(userKey);
  });
}

/**
 * Clear all data for a specific user (used on logout)
 * @param {number} userId - User ID to clear data for
 */
export function clearUserData(userId) {
  if (!userId) return;
  Object.values(BASE_KEYS).forEach((baseKey) => {
    localStorage.removeItem(`meltmonitor_u${userId}_${baseKey}`);
  });
}

// ============ EXPORT/IMPORT ============

/**
 * Export all user data
 * @returns {Object} All user data
 */
export function exportUserData() {
  return {
    savedViews: getSavedViews(),
    homeCountry: getHomeCountry(),
    preferences: getPreferences(),
    streak: getStreak(),
    quizStats: getQuizStats(),
    badges: getBadges(),
    goals: getGoals(),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import user data
 * @param {Object} data - Data to import
 */
export function importUserData(data) {
  try {
    if (data.savedViews && Array.isArray(data.savedViews)) {
      const existing = getSavedViews();
      const existingNames = new Set(existing.map((v) => v.name));
      const newViews = data.savedViews.filter(
        (v) => !existingNames.has(v.name)
      );
      localStorage.setItem(
        STORAGE_KEYS.SAVED_VIEWS,
        JSON.stringify([...existing, ...newViews])
      );
    }

    if (data.homeCountry) {
      setHomeCountry(data.homeCountry);
    }

    if (data.preferences) {
      updatePreferences(data.preferences);
    }

    return true;
  } catch (e) {
    console.error("Error importing data:", e);
    return false;
  }
}

// Export both for backward compatibility
export { STORAGE_KEYS, BASE_KEYS, getCurrentUserId };

// ============ QUIZ STATS ============

/**
 * Get quiz statistics
 * @returns {Object} { completed, correct, perfectScores }
 */
export function getQuizStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_STATS);
    return data
      ? JSON.parse(data)
      : { completed: 0, correct: 0, perfectScores: 0 };
  } catch (e) {
    console.error("Error reading quiz stats:", e);
    return { completed: 0, correct: 0, perfectScores: 0 };
  }
}

/**
 * Save quiz statistics
 * @param {Object} stats - Quiz stats to save
 */
export function saveQuizStats(stats) {
  try {
    const current = getQuizStats();
    const updated = { ...current, ...stats };
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving quiz stats:", e);
    return null;
  }
}

/**
 * Record a completed quiz
 * @param {number} score - Number of correct answers
 * @param {number} total - Total questions
 */
export function recordQuizCompletion(score, total) {
  try {
    const stats = getQuizStats();
    const updated = {
      completed: stats.completed + 1,
      correct: (stats.correct || 0) + score,
      totalQuestions: (stats.totalQuestions || 0) + total,
      totalCorrect: (stats.totalCorrect || stats.correct || 0) + score,
      perfectScores: (stats.perfectScores || 0) + (score === total ? 1 : 0),
      lastQuizDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error recording quiz:", e);
    return null;
  }
}

// ============ BADGES ============

/**
 * Get unlocked badges
 * @returns {Array} Array of badge IDs
 */
export function getBadges() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BADGES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading badges:", e);
    return [];
  }
}

/**
 * Unlock a badge
 * @param {string} badgeId - Badge ID to unlock
 */
export function unlockBadge(badgeId) {
  try {
    const badges = getBadges();
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    }
    return badges;
  } catch (e) {
    console.error("Error unlocking badge:", e);
    return [];
  }
}

// ============ GOALS ============

/**
 * Get user goals
 * @returns {Array} Array of goal objects
 */
export function getGoals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading goals:", e);
    return [];
  }
}

/**
 * Save a new goal
 * @param {Object} goal - { title, target, type, deadline }
 */
export function saveGoal(goal) {
  try {
    const goals = getGoals();
    const newGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      progress: 0,
      completed: false,
    };
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return newGoal;
  } catch (e) {
    console.error("Error saving goal:", e);
    return null;
  }
}

/**
 * Update goal progress
 * @param {string} goalId - Goal ID
 * @param {number} progress - New progress value
 */
export function updateGoalProgress(goalId, progress) {
  try {
    const goals = getGoals();
    const index = goals.findIndex((g) => g.id === goalId);
    if (index !== -1) {
      goals[index].progress = progress;
      goals[index].completed = progress >= goals[index].target;
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return goals[index];
    }
    return null;
  } catch (e) {
    console.error("Error updating goal:", e);
    return null;
  }
}

/**
 * Delete a goal
 * @param {string} goalId - Goal ID to delete
 */
export function deleteGoal(goalId) {
  try {
    const goals = getGoals();
    const filtered = goals.filter((g) => g.id !== goalId);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error("Error deleting goal:", e);
    return [];
  }
}

// ============ CARBON FOOTPRINT ============

/**
 * Get carbon footprint data
 * @returns {Object} Carbon footprint calculation data
 */
export function getCarbonFootprint() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CARBON_FOOTPRINT);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading carbon footprint:", e);
    return null;
  }
}

/**
 * Save carbon footprint data
 * @param {Object} footprint - Carbon footprint data
 */
export function saveCarbonFootprint(footprint) {
  try {
    const data = {
      ...footprint,
      calculatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CARBON_FOOTPRINT, JSON.stringify(data));
    return data;
  } catch (e) {
    console.error("Error saving carbon footprint:", e);
    return null;
  }
}

// ============ DAILY QUIZ REMINDER ============

/**
 * Get reminder preferences
 * @returns {Object} { enabled, lastDismissed, notificationTime }
 */
export function getReminderPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUIZ_REMINDER);
    return data
      ? JSON.parse(data)
      : { enabled: true, lastDismissed: null, notificationTime: "09:00" };
  } catch (e) {
    console.error("Error reading reminder preferences:", e);
    return { enabled: true, lastDismissed: null, notificationTime: "09:00" };
  }
}

/**
 * Update reminder preferences
 * @param {Object} prefs - Preferences to update
 */
export function updateReminderPreferences(prefs) {
  try {
    const current = getReminderPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(
      STORAGE_KEYS.DAILY_QUIZ_REMINDER,
      JSON.stringify(updated)
    );
    return updated;
  } catch (e) {
    console.error("Error updating reminder preferences:", e);
    return null;
  }
}

/**
 * Dismiss today's reminder
 */
export function dismissDailyReminder() {
  const today = new Date().toISOString().split("T")[0];
  return updateReminderPreferences({ lastDismissed: today });
}

/**
 * Check if should show daily quiz reminder
 * @returns {boolean}
 */
export function shouldShowDailyReminder() {
  const prefs = getReminderPreferences();
  const today = new Date().toISOString().split("T")[0];

  // Don't show if disabled
  if (!prefs.enabled) return false;

  // Don't show if already dismissed today
  if (prefs.lastDismissed === today) return false;

  // Don't show if already completed today's quiz
  if (hasCompletedDailyQuiz()) return false;

  return true;
}

// ============ AI CHAT STATS ============

/**
 * Get AI chat usage stats
 * @returns {Object} { messagesCount, sessionsCount }
 */
export function getAIChatStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AI_CHAT_STATS);
    return data ? JSON.parse(data) : { messagesCount: 0, sessionsCount: 0 };
  } catch (e) {
    console.error("Error reading AI chat stats:", e);
    return { messagesCount: 0, sessionsCount: 0 };
  }
}

/**
 * Record an AI chat message
 */
export function recordAIChatMessage() {
  try {
    const stats = getAIChatStats();
    stats.messagesCount += 1;
    localStorage.setItem(STORAGE_KEYS.AI_CHAT_STATS, JSON.stringify(stats));
    return stats;
  } catch (e) {
    console.error("Error recording AI chat message:", e);
    return null;
  }
}

/**
 * Record a new AI chat session
 */
export function recordAIChatSession() {
  try {
    const stats = getAIChatStats();
    stats.sessionsCount += 1;
    localStorage.setItem(STORAGE_KEYS.AI_CHAT_STATS, JSON.stringify(stats));
    return stats;
  } catch (e) {
    console.error("Error recording AI chat session:", e);
    return null;
  }
}

// ============ GOALS STATS ============

/**
 * Get count of completed goals
 * @returns {number}
 */
export function getCompletedGoalsCount() {
  const goals = getGoals();
  return goals.filter((g) => g.completed).length;
}
