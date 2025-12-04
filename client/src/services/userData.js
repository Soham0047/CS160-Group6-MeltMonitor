/**
 * Unified Data Service
 * Uses API when authenticated, falls back to localStorage when offline/unauthenticated
 */

import * as api from "./api";
import * as local from "./localStorage";

// Check if user is authenticated
function isAuth() {
  return api.isAuthenticated();
}

// ============ SAVED VIEWS ============

export async function getSavedViews() {
  if (isAuth()) {
    try {
      return await api.getSavedViews();
    } catch (error) {
      console.debug("API unavailable, using localStorage");
    }
  }
  return local.getSavedViews();
}

export async function saveView(view) {
  // Always save locally first (for offline support)
  const localView = local.saveView(view);

  if (isAuth()) {
    try {
      return await api.saveView(view);
    } catch (error) {
      console.debug("API unavailable, saved locally");
    }
  }
  return localView;
}

export async function deleteView(viewId) {
  // Delete locally
  local.deleteView(viewId);

  if (isAuth()) {
    try {
      await api.deleteView(viewId);
    } catch (error) {
      console.debug("API unavailable, deleted locally");
    }
  }
}

export async function updateView(viewId, updates) {
  local.updateView(viewId, updates);

  if (isAuth()) {
    try {
      return await api.updateView(viewId, updates);
    } catch (error) {
      console.debug("API unavailable, updated locally");
    }
  }
  return { ...updates, id: viewId };
}

// ============ HOME COUNTRY ============

export async function getHomeCountry() {
  if (isAuth()) {
    try {
      const prefs = await api.getPreferences();
      return prefs?.homeCountry || null;
    } catch {
      // Fall through to localStorage
    }
  }
  return local.getHomeCountry();
}

export async function setHomeCountry(country) {
  local.setHomeCountry(country);

  if (isAuth()) {
    try {
      await api.setHomeCountry(country.iso3, country.name);
    } catch {
      console.debug("API unavailable, saved locally");
    }
  }
}

// ============ PREFERENCES ============

export async function getPreferences() {
  if (isAuth()) {
    try {
      return await api.getPreferences();
    } catch {
      // Fall through
    }
  }
  return local.getPreferences();
}

export async function updatePreferences(updates) {
  local.updatePreferences(updates);

  if (isAuth()) {
    try {
      return await api.updatePreferences(updates);
    } catch {
      console.debug("API unavailable, saved locally");
    }
  }
  return { ...local.getPreferences(), ...updates };
}

// ============ STREAK ============

export async function getStreak() {
  if (isAuth()) {
    try {
      return await api.getStreak();
    } catch {
      // Fall through
    }
  }
  return local.getStreak();
}

export async function recordDailyQuiz(score, total) {
  // Always record locally
  const localStreak = local.recordDailyQuiz(score, total);

  if (isAuth()) {
    try {
      return await api.recordActivity();
    } catch {
      console.debug("API unavailable, recorded locally");
    }
  }
  return localStreak;
}

// ============ EXPORT/IMPORT ============

export async function exportUserData() {
  if (isAuth()) {
    try {
      return await api.exportUserData();
    } catch {
      // Fall through
    }
  }
  return local.exportUserData();
}

export async function importUserData(data) {
  // Always import locally
  local.importUserData(data);

  if (isAuth()) {
    try {
      return await api.importUserData(data);
    } catch {
      console.debug("API unavailable, imported locally");
    }
  }
}

// Re-export for convenience
export { isAuth as isAuthenticated };
