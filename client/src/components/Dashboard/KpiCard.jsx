import { Card, CardContent, Typography, Box } from "@mui/material";

export default function KpiCard({ label, value, sublabel, delta, icon }) {
  const deltaColor =
    delta > 0 ? "error.main" : delta < 0 ? "success.main" : "text.secondary";
  const deltaSign = delta > 0 ? "▲" : delta < 0 ? "▼" : "•";

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ my: 0.5 }}>
          {value}
        </Typography>
        {sublabel && (
          <Typography variant="body2" color="text.secondary">
            {sublabel}
          </Typography>
        )}
        {typeof delta === "number" && (
          <Typography variant="body2" sx={{ mt: 0.5, color: deltaColor }}>
            {deltaSign} {Math.abs(delta)}% vs last entry
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
