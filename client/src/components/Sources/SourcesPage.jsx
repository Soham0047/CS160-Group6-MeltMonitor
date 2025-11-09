import {
    Container,
    Paper,
    Typography,
    Link,
    Grid,
    Box
} from "@mui/material";

export default function SourcesPage() {
    return (
        <Container maxWidth="md" sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* this is where the title for the page goes */}
            <Typography variant="h5" gutterBottom textAlign="center">
                Where Do We Pull Our Data From?
            </Typography>
            
            {/* grid section for the CO2 Data source(s) */}
            <Grid container spacing={2} direction="column" alignItems="center" sx={{ width: "100%", mt: 1}}>
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> NOAA CO2 Trends</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Atmospheric CO2 data collected from Mauna Loa and other global observatories.
                        </Typography>
                        <Link
                            href="https://gml.noaa.gov/ccgg/trends/"
                            target="_blank"
                            rel="noreferrer">
                                Visit NOAA Data
                        </Link>
                    </Paper>
                </Grid>

                {/* grid section for the Temperature Data source(s) */}
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> NASA GISTEMP</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Global surface temperature data based on NASA's Goddard Institute for Space Studies.
                        </Typography>
                        <Link 
                            href="https://data.giss.nasa.gov/gistemp/"
                            target="_blank"
                            rel="noreferrer">
                                Visit NASA Data
                        </Link>
                    </Paper>
                </Grid>

                {/* grid section for the glacier index data source(s) */}
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Glacier Index Trends</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            This is where global glacier index trends has been collected from.
                        </Typography>
                        <Link
                            href="https://its-live.jpl.nasa.gov/#:~:text=Access%20Documentation%20People-,Overview,Spatial%20coverage:%20Global!"
                            target="_blank"
                            rel="noreferrer">
                                Visit NASA Data
                        </Link>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4}}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    MeltMonitor seeks to be a leader in global CO2, Temperature, and Glacier Index tracking and visualization.
                    As we continue to update our product to provide our audience the best and most reliable data, additional sources will be added.
                </Typography>
            </Box>
        </Container>
    )
}