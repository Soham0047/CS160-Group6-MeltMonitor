import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import {
  getSavedViews as getLocalViews,
  saveView as saveLocalView,
  deleteView as deleteLocalView,
  updateView as updateLocalView,
} from "../../services/localStorage";
import * as api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

/**
 * SaveViewButton - Button to save current map state
 */
export function SaveViewButton({ currentState, onSave }) {
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!viewName.trim()) {
      setError("Please enter a name for this view");
      return;
    }

    setSaving(true);
    const viewData = {
      name: viewName.trim(),
      metric: currentState.metric,
      year: currentState.year,
      selectedCountry: currentState.selectedCountry || null,
    };

    try {
      let newView;

      // Save locally first
      newView = saveLocalView(viewData);

      // If authenticated, also save to backend
      if (isAuthenticated) {
        try {
          newView = await api.saveView(viewData);
        } catch (e) {
          console.debug("Failed to save to backend, using local:", e);
        }
      }

      if (newView) {
        setDialogOpen(false);
        setViewName("");
        setError("");
        if (onSave) onSave(newView);
      }
    } catch (e) {
      setError("Failed to save view");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Tooltip title="Save current view">
        <Button
          variant="outlined"
          startIcon={<BookmarkBorderIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderColor: "rgba(255,255,255,0.5)",
            color: "white",
            "&:hover": {
              borderColor: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Save View
        </Button>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BookmarkIcon />
            Save Current View
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Save the current map state to quickly return to it later.
          </Typography>

          <TextField
            autoFocus
            label="View Name"
            fullWidth
            value={viewName}
            onChange={(e) => {
              setViewName(e.target.value);
              setError("");
            }}
            placeholder="e.g., Top Emitters 2024"
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              p: 2,
              bgcolor: "rgba(102, 126, 234, 0.1)",
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              This view will save:
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                label={`Metric: ${currentState.metric === "co2" ? "Total CO₂" : "Per Capita"}`}
                size="small"
              />
              <Chip label={`Year: ${currentState.year}`} size="small" />
              {currentState.selectedCountry && (
                <Chip
                  label={`Country: ${currentState.selectedCountry}`}
                  size="small"
                  color="primary"
                />
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={
              saving ? <CircularProgress size={16} /> : <BookmarkIcon />
            }
            disabled={saving}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {saving ? "Saving..." : "Save View"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * SavedViewsList - Display list of saved views
 */
export function SavedViewsList({ onLoadView }) {
  const { isAuthenticated } = useAuth();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Fetch views on mount and when auth changes
  useEffect(() => {
    const fetchViews = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const backendViews = await api.getSavedViews();
          setViews(backendViews);
        } catch (e) {
          console.debug("Using local views:", e);
          setViews(getLocalViews());
        }
      } else {
        setViews(getLocalViews());
      }
      setLoading(false);
    };
    fetchViews();
  }, [isAuthenticated]);

  const handleDelete = async (viewId) => {
    // Delete locally
    deleteLocalView(viewId);

    // If authenticated, also delete from backend
    if (isAuthenticated) {
      try {
        await api.deleteView(viewId);
      } catch (e) {
        console.debug("Failed to delete from backend:", e);
      }
    }

    // Refresh the list
    if (isAuthenticated) {
      try {
        const backendViews = await api.getSavedViews();
        setViews(backendViews);
      } catch {
        setViews(getLocalViews());
      }
    } else {
      setViews(getLocalViews());
    }
  };

  const handleSaveNote = async (viewId) => {
    // Update locally
    updateLocalView(viewId, { note: noteText });

    // If authenticated, also update backend
    if (isAuthenticated) {
      try {
        await api.updateView(viewId, { note: noteText });
      } catch (e) {
        console.debug("Failed to update backend:", e);
      }
    }

    // Refresh the list
    if (isAuthenticated) {
      try {
        const backendViews = await api.getSavedViews();
        setViews(backendViews);
      } catch {
        setViews(getLocalViews());
      }
    } else {
      setViews(getLocalViews());
    }

    setEditingNote(null);
    setNoteText("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (views.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No saved views yet. Go to the Map page and click "Save View" to bookmark
        interesting data states!
        {isAuthenticated && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
            <CloudIcon fontSize="small" color="primary" />
            <Typography variant="caption">
              Your views will sync across devices
            </Typography>
          </Box>
        )}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {isAuthenticated && (
        <Alert severity="success" icon={<CloudIcon />} sx={{ borderRadius: 2 }}>
          Your saved views are synced to your account
        </Alert>
      )}
      {views.map((view) => (
        <Card
          key={view.id}
          sx={{
            borderRadius: 3,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {view.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Saved {new Date(view.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <BookmarkIcon color="primary" />
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                label={view.metric === "co2" ? "Total CO₂" : "Per Capita"}
                size="small"
                variant="outlined"
              />
              <Chip label={view.year} size="small" variant="outlined" />
              {view.selectedCountry && (
                <Chip
                  label={view.selectedCountry}
                  size="small"
                  color="primary"
                />
              )}
            </Stack>

            {/* Reflection Note */}
            {view.note && editingNote !== view.id && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                  borderRadius: 2,
                  borderLeft: "3px solid #667eea",
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  "{view.note}"
                </Typography>
              </Box>
            )}

            {/* Edit Note */}
            {editingNote === view.id && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add your reflection (max 280 chars)"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, 280))}
                  inputProps={{ maxLength: 280 }}
                  helperText={`${noteText.length}/280`}
                  size="small"
                />
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button size="small" onClick={() => handleSaveNote(view.id)}>
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingNote(null);
                      setNoteText("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={() => onLoadView && onLoadView(view)}
              sx={{ color: "#667eea" }}
            >
              Open
            </Button>
            <Tooltip title="Add reflection">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingNote(view.id);
                  setNoteText(view.note || "");
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete view">
              <IconButton
                size="small"
                onClick={() => handleDelete(view.id)}
                sx={{ color: "error.main" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}

export { getLocalViews as getSavedViews };
