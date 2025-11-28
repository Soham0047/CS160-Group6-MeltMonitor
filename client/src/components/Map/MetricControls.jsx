import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material";

export default function MetricControls({
  metric,
  setMetric,
  year,
  setYear,
  yearRange,
}) {
  const [minYear, maxYear] = yearRange;
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        p: 1.5,
        boxShadow: 2,
        width: 300,
      }}
    >
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <InputLabel id="metric-label">Metric</InputLabel>
        <Select
          labelId="metric-label"
          value={metric}
          label="Metric"
          onChange={(e) => setMetric(e.target.value)}
        >
          <MenuItem value="co2">Total CO₂ (Mt)</MenuItem>
          <MenuItem value="co2_per_capita">CO₂ per capita (t)</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
        Year: <b>{year}</b>
      </Typography>
      <Slider
        size="small"
        value={year}
        min={minYear}
        max={maxYear}
        step={1}
        valueLabelDisplay="auto"
        onChange={(_, v) => setYear(v)}
      />
    </Box>
  );
}
