import { Card, CardContent, Typography, Box } from "@mui/material";

export default function KpiCard({ label, value, sublabel, secondarySublabel, delta, icon }) {
  const deltaColor =
    delta > 0 ? "error.main" : delta < 0 ? "success.main" : "text.secondary";
  const deltaSign = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";

  return (
    <Card
      sx={{
        height: "100%",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 16px 64px rgba(0,0,0,0.2)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: 1,
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            my: 1.5,
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {value}
        </Typography>
        {sublabel && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {sublabel}
          </Typography>
        )}
          <Box
              sx={{
                  display: "flex",
                  alignItems: "center", // Vertically center the delta box and the secondary label
                  gap: 1, // Space between the delta box and the secondary label
                  mb: 1, // Keep the bottom margin on the wrapper
              }}
          >
          {/* PERCENTAGE BOX (DELTA) */}
          {typeof delta === "number" && (
              <Box
                  sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      background:
                          delta > 0
                              ? "rgba(244, 67, 54, 0.1)"
                              : delta < 0
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(158, 158, 158, 0.1)",
                      color: deltaColor,
                      fontWeight: 600,
                      fontSize: 13,
                  }}
              >
                  <span>{deltaSign}</span>
                  <span>{Math.abs(delta)}%</span>
              </Box>
          )}
          {secondarySublabel && (
              <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                      fontWeight: 500
                  }}
              >
                  {secondarySublabel}
              </Typography>
          )}
      </Box>
      </CardContent>
    </Card>
  );
}
