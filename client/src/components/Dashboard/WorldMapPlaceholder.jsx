import { Box, Typography } from "@mui/material";

export default function WorldMapPlaceholder() {
  return (
    <Box
      sx={{
        height: 360,
        bgcolor: "grey.100",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography color="text.secondary">
        Map goes here (Leaflet / Mapbox later)
      </Typography>
    </Box>
  );
}
