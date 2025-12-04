import { useState } from "react";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link,
  Chip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import glossaryData from "../../data/glossary.json";

// Quick definitions for inline terms
const TERM_DEFINITIONS = {
  "CO₂":
    "Carbon dioxide - the primary greenhouse gas driving climate change, released mainly from burning fossil fuels.",
  "carbon footprint":
    "The total amount of greenhouse gases produced by human activities, measured in tonnes of CO₂ equivalent.",
  "per capita emissions":
    "Total emissions divided by population, showing average emissions per person in a country.",
  "greenhouse gases":
    "Gases that trap heat in Earth's atmosphere, including CO₂, methane, and nitrous oxide.",
};

/**
 * GlossaryTooltip - Shows a ? icon that reveals metric definition
 * @param {string} metricId - The metric ID to look up (e.g., 'co2_total', 'co2_per_capita')
 * @param {string} term - Simple term to display inline definition
 * @param {string} size - Icon size ('small', 'medium')
 */
export default function GlossaryTooltip({ metricId, term, size = "small" }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // If using simple term mode, show inline tooltip
  if (term) {
    const definition = TERM_DEFINITIONS[term] || term;
    return (
      <Tooltip title={definition} arrow>
        <span
          style={{
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            cursor: "help",
            color: "#667eea",
          }}
        >
          {term}
        </span>
      </Tooltip>
    );
  }

  // Find the metric in glossary
  const metric = glossaryData.metrics.find((m) => m.id === metricId);

  if (!metric) {
    return null;
  }

  return (
    <>
      <Tooltip title={metric.short} arrow placement="top">
        <IconButton
          size={size}
          onClick={() => setDialogOpen(true)}
          sx={{
            ml: 0.5,
            p: 0.5,
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "rgba(102, 126, 234, 0.1)",
            },
          }}
        >
          <HelpOutlineIcon fontSize={size} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <MenuBookIcon />
          {metric.term}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            {metric.long || metric.short}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              label={`Unit: ${metric.unit}`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: "rgba(102, 126, 234, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Source:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {metric.sourceUrl ? (
                <Link
                  href={metric.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#667eea" }}
                >
                  {metric.source}
                </Link>
              ) : (
                metric.source
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 2,
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * GlossaryButton - Full glossary browser button
 */
export function GlossaryButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const allItems = [...glossaryData.metrics, ...glossaryData.concepts];

  return (
    <>
      <Tooltip title="Climate Glossary">
        <IconButton
          onClick={() => setDialogOpen(true)}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <MenuBookIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedMetric(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "80vh" },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MenuBookIcon />
          Climate Glossary
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: "flex", minHeight: 400 }}>
            {/* Term List */}
            <Box
              sx={{
                width: 200,
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
              }}
            >
              {allItems.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => setSelectedMetric(item)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    bgcolor:
                      selectedMetric?.id === item.id
                        ? "rgba(102, 126, 234, 0.1)"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={selectedMetric?.id === item.id ? 700 : 400}
                  >
                    {item.term}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Definition Panel */}
            <Box sx={{ flex: 1, p: 3 }}>
              {selectedMetric ? (
                <>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {selectedMetric.term}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedMetric.long || selectedMetric.short}
                  </Typography>
                  {selectedMetric.unit && (
                    <Chip
                      label={`Unit: ${selectedMetric.unit}`}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Source:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedMetric.sourceUrl ? (
                        <Link
                          href={selectedMetric.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedMetric.source}
                        </Link>
                      ) : (
                        selectedMetric.source
                      )}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography>← Select a term to see its definition</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setSelectedMetric(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
