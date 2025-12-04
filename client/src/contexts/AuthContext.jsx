import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as api from "../services/api";
import * as localStorage from "../services/localStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getCachedUser());
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          setIsOnline(true);
        } catch (error) {
          if (error.message === "OFFLINE") {
            setIsOnline(false);
            // Use cached user data
            setUser(api.getCachedUser());
          } else {
            // Token invalid
            api.removeToken();
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth expiry
    const handleExpiry = () => {
      setUser(null);
    };
    window.addEventListener("auth:expired", handleExpiry);

    return () => window.removeEventListener("auth:expired", handleExpiry);
  }, []);

  const register = useCallback(async (email, password, name) => {
    const data = await api.register(email, password, name);
    setUser(data.user);
    setIsOnline(true);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setIsOnline(true);

    // Sync localStorage data to backend after login
    await syncLocalDataToBackend();

    return data;
  }, []);

  // Google OAuth login
  const loginWithGoogle = useCallback(() => {
    api.loginWithGoogle();
  }, []);

  // Handle OAuth callback (called from callback page)
  const handleOAuthCallback = useCallback(async (token) => {
    if (api.handleOAuthCallback(token)) {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsOnline(true);

        // Sync localStorage data to backend after OAuth login
        await syncLocalDataToBackend();

        return { success: true, user: userData };
      } catch (error) {
        console.error("Failed to get user after OAuth:", error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: "No token provided" };
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  // Sync local data to backend when user logs in
  const syncLocalDataToBackend = async () => {
    try {
      // Get local data
      const localViews = localStorage.getSavedViews();
      const localHomeCountry = localStorage.getHomeCountry();

      // Import to backend
      if (localViews.length > 0 || localHomeCountry) {
        await api.importUserData({
          savedViews: localViews,
          preferences: localHomeCountry
            ? { homeCountry: localHomeCountry }
            : {},
        });
        console.log("Local data synced to backend");
      }
    } catch (error) {
      console.debug("Failed to sync local data:", error);
    }
  };

  const value = {
    user,
    loading,
    isOnline,
    isAuthenticated: !!user,
    register,
    login,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    refreshUser: async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.debug("Failed to refresh user:", error);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
