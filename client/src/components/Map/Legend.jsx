import { Box, Typography } from "@mui/material";
import { rampRdYlGnReversed } from "../../utils/color";

export default function Legend({ min, mid, max, label }) {
  const steps = 12;
  const swatches = Array.from({ length: steps }, (_, i) => i / (steps - 1));
  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        bottom: 16,
        transform: "translateX(-50%)",
        zIndex: 1000,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        p: 1.5,
        width: 260,
        boxShadow: 2,
      }}
    >
      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${steps}, 1fr)`,
          gap: 0.25,
        }}
      >
        {swatches.map((t, i) => (
          <Box
            key={i}
            sx={{
              height: 10,
              bgcolor: rampRdYlGnReversed(t),
              borderRadius: 0.5,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption">{fmt(min)}</Typography>
        <Typography variant="caption">{fmt(mid)}</Typography>
        <Typography variant="caption">{fmt(max)}</Typography>
      </Box>
    </Box>
  );
}

function fmt(n) {
  if (n == null || !Number.isFinite(n)) return "–";
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}
