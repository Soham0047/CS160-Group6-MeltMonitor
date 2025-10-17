import { Container, Paper, Typography } from "@mui/material";
import WorldMap from "../components/Map/WorldMap.jsx";

export default function MapPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Global Impact Map
        </Typography>
        <WorldMap />
      </Paper>
    </Container>
  );
}
