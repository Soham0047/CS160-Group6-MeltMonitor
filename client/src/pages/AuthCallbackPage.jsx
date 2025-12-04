import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert, Paper } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

/**
 * OAuth Callback Page
 * Handles the redirect from Google OAuth and stores the token
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/auth?error=" + errorParam), 2000);
        return;
      }

      if (token) {
        const result = await handleOAuthCallback(token);

        if (result.success) {
          // Successfully authenticated, redirect to profile
          navigate("/profile", { replace: true });
        } else {
          setError(result.error || "Failed to complete sign-in.");
          setTimeout(() => navigate("/auth"), 2000);
        }
      } else {
        setError("No authentication token received.");
        setTimeout(() => navigate("/auth"), 2000);
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          minWidth: 300,
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography color="text.secondary">
              Redirecting to login...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress
              size={48}
              sx={{
                mb: 3,
                color: "#667eea",
              }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Completing Sign-In...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we set up your account.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}
