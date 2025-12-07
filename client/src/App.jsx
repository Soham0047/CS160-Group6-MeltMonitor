import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import TopBar from "./components/Navigation/TopBar";
import { useAuth } from "./contexts/AuthContext";

// Lazy load pages for faster initial load
const DashboardPage = lazy(
  () => import("./components/Dashboard/DashboardPage")
);
const MapPage = lazy(() => import("./pages/MapPage"));
const SourcesPage = lazy(() => import("./components/Sources/SourcesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));

// Loading fallback component
function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <CircularProgress sx={{ color: "white" }} size={48} />
    </Box>
  );
}

// Protected Route component - requires authentication
function ProtectedRoute({ children, redirectMessage }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        state={{
          from: location.pathname,
          message: redirectMessage || "Please sign in to access this page",
        }}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <>
      <TopBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/learn"
            element={
              <ProtectedRoute redirectMessage="Please sign in to access the Learning Center">
                <LearnPage />
              </ProtectedRoute>
            }
          />
          <Route path="/sources" element={<SourcesPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute redirectMessage="Please sign in to view your profile and personalized data">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
