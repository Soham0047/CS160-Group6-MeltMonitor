import { Box, Typography, Chip, Tooltip, Paper } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PublicIcon from "@mui/icons-material/Public";

/**
 * QuickCompare - Shows selected country vs world average
 * @param {Object} props
 * @param {string} props.countryName - Selected country name
 * @param {number} props.countryValue - Country's emission value
 * @param {number} props.worldValue - World average value
 * @param {string} props.metric - 'co2' or 'co2_per_capita'
 * @param {number} props.year - Selected year
 */
export default function QuickCompare({
  countryName,
  countryValue,
  worldValue,
  metric,
  year,
}) {
  if (!countryValue || !worldValue) {
    return null;
  }

  const isPerCapita = metric === "co2_per_capita";
  const ratio = countryValue / worldValue;
  const percentDiff = ((countryValue - worldValue) / worldValue) * 100;
  const isAboveAverage = percentDiff > 0;

  const formatValue = (value) => {
    if (isPerCapita) {
      return `${value.toFixed(2)} t/person`;
    }
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)} Gt`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)} Mt`;
    }
    return `${value.toFixed(0)} t`;
  };

  const getComparisonText = () => {
    if (Math.abs(percentDiff) < 5) {
      return "Near world average";
    }
    if (isAboveAverage) {
      if (ratio >= 5) return `${ratio.toFixed(1)}× world average`;
      return `${Math.abs(percentDiff).toFixed(0)}% above average`;
    }
    return `${Math.abs(percentDiff).toFixed(0)}% below average`;
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        background: isAboveAverage
          ? "linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0.05) 100%)"
          : "linear-gradient(135deg, rgba(46,125,50,0.1) 0%, rgba(46,125,50,0.05) 100%)",
        border: `1px solid ${isAboveAverage ? "rgba(255,107,107,0.3)" : "rgba(46,125,50,0.3)"}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {countryName} vs World
        </Typography>
        <Chip label={year} size="small" variant="outlined" />
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        {/* Country Value */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {countryName}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {formatValue(countryValue)}
          </Typography>
        </Box>

        {/* Comparison */}
        <Box sx={{ textAlign: "center" }}>
          <Tooltip title={getComparisonText()}>
            <Chip
              icon={isAboveAverage ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={getComparisonText()}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: isAboveAverage
                  ? "rgba(255,107,107,0.2)"
                  : "rgba(46,125,50,0.2)",
                color: isAboveAverage ? "#d32f2f" : "#2e7d32",
                "& .MuiChip-icon": {
                  color: isAboveAverage ? "#d32f2f" : "#2e7d32",
                },
              }}
            />
          </Tooltip>
        </Box>

        {/* World Average */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <PublicIcon sx={{ fontSize: 14 }} /> World Avg
          </Typography>
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            {formatValue(worldValue)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

/**
 * MiniCompareChip - Compact comparison for tight spaces
 */
export function MiniCompareChip({ countryValue, worldValue }) {
  if (!countryValue || !worldValue) return null;

  const ratio = countryValue / worldValue;
  const isAbove = ratio > 1;

  return (
    <Tooltip title={`${isAbove ? "Above" : "Below"} world average`}>
      <Chip
        size="small"
        icon={isAbove ? <TrendingUpIcon /> : <TrendingDownIcon />}
        label={`${ratio.toFixed(1)}× avg`}
        sx={{
          fontSize: "0.7rem",
          height: 24,
          backgroundColor: isAbove
            ? "rgba(255,107,107,0.2)"
            : "rgba(46,125,50,0.2)",
          color: isAbove ? "#d32f2f" : "#2e7d32",
          "& .MuiChip-icon": {
            fontSize: 14,
            color: isAbove ? "#d32f2f" : "#2e7d32",
          },
        }}
      />
    </Tooltip>
  );
}
