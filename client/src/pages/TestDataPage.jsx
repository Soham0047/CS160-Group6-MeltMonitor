import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  fetchCountriesGeoJSON,
  fetchLocalIndex,
} from "../services/mapDataLocal";

export default function TestDataPage() {
  const [status, setStatus] = useState("Loading...");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setStatus("Fetching GeoJSON...");
        const geo = await fetchCountriesGeoJSON();

        setStatus("Fetching CO2 data...");
        const index = await fetchLocalIndex();

        setResults({
          countries: geo.features.length,
          dataCountries: index.byIso.size,
          years: index.years.length,
          yearRange: `${index.years[0]} - ${index.years[index.years.length - 1]}`,
          sampleCountry: geo.features[0].properties,
          sampleData: index.byIso.get("USA")?.[2020] || "No data",
        });

        setStatus("Success!");
      } catch (err) {
        setError(err.message);
        setStatus("Error");
      }
    })();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Data Loading Test
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            <strong>Status:</strong> {status}
          </Typography>
        </Box>

        {error && (
          <Box sx={{ my: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography color="error.contrastText">
              <strong>Error:</strong> {error}
            </Typography>
          </Box>
        )}

        {results && (
          <Box sx={{ my: 2 }}>
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {JSON.stringify(results, null, 2)}
            </Typography>
          </Box>
        )}

        {!results && !error && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Container>
  );
}
