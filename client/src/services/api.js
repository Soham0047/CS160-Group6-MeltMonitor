/**
 * API Client for MeltMonitor Backend
 * Handles authentication and user data syncing
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY = "meltmonitor_auth_token";
const USER_KEY = "meltmonitor_user";

// ============ TOKEN MANAGEMENT ============

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCachedUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

// ============ API HELPERS ============

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    credentials: "include", // Include cookies for session
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiry
      if (data.code === "TOKEN_EXPIRED" || data.code === "INVALID_TOKEN") {
        removeToken();
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    // Network error - API might be down
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.debug("API unavailable, using offline mode");
      throw new Error("OFFLINE");
    }
    throw error;
  }
}

// ============ AUTH API ============

export async function register(email, password, name = "") {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });

  setToken(data.token);
  setCachedUser(data.user);

  return data;
}

export async function login(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setCachedUser(data.user);

  return data;
}

/**
 * Initiate Google OAuth login
 * Redirects to Google's OAuth page
 */
export function loginWithGoogle() {
  window.location.href = `${API_BASE}/api/auth/google`;
}

/**
 * Handle OAuth callback - extract and store token
 */
export function handleOAuthCallback(token) {
  if (token) {
    setToken(token);
    return true;
  }
  return false;
}

/**
 * Check for active session (OAuth)
 */
export async function checkSession() {
  try {
    const data = await apiRequest("/api/auth/session");
    if (data.authenticated && data.token) {
      setToken(data.token);
      setCachedUser(data.user);
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore errors on logout
  } finally {
    removeToken();
  }
}

export async function getCurrentUser() {
  const data = await apiRequest("/api/auth/me");
  setCachedUser(data.user);
  return data.user;
}

// ============ PREFERENCES API ============

export async function getPreferences() {
  const data = await apiRequest("/api/user/preferences");
  return data.preferences;
}

export async function updatePreferences(updates) {
  const data = await apiRequest("/api/user/preferences", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.preferences;
}

export async function setHomeCountry(iso3, name) {
  const data = await apiRequest("/api/user/home-country", {
    method: "PUT",
    body: JSON.stringify({ iso3, name }),
  });
  return data.homeCountry;
}

// ============ SAVED VIEWS API ============

export async function getSavedViews() {
  const data = await apiRequest("/api/user/views");
  return data.views;
}

export async function saveView(view) {
  const data = await apiRequest("/api/user/views", {
    method: "POST",
    body: JSON.stringify(view),
  });
  return data.view;
}

export async function deleteView(viewId) {
  await apiRequest(`/api/user/views/${viewId}`, {
    method: "DELETE",
  });
}

export async function updateView(viewId, updates) {
  const data = await apiRequest(`/api/user/views/${viewId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.view;
}

// ============ STREAK API ============

export async function getStreak() {
  const data = await apiRequest("/api/user/streak");
  return data.streak;
}

export async function recordActivity() {
  const data = await apiRequest("/api/user/streak/record", {
    method: "POST",
  });
  return data.streak;
}

// ============ EXPLORED COUNTRIES API ============

export async function getExploredCountries() {
  const data = await apiRequest("/api/user/explored");
  return data.countries;
}

export async function markCountryExplored(iso3) {
  const data = await apiRequest(`/api/user/explored/${iso3}`, {
    method: "POST",
  });
  return data.countries;
}

// ============ EXPORT/IMPORT ============

export async function exportUserData() {
  return await apiRequest("/api/user/export");
}

export async function importUserData(data) {
  return await apiRequest("/api/user/import", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============ API STATUS ============

export async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}
