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
                            Atmospheric CO2 data trends on a global scale collected daily by NOAA.
                        </Typography>
                        <Link
                            href="https://gml.noaa.gov/ccgg/trends/gl_trend.html"
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
                            Global surface temperature data based on NASA's Goddard Institute for Space Studies recordings. <br />
                            <br />
                            - GISTEMP Team, 2025: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed 20YY-MM-DD at https://data.giss.nasa.gov/gistemp/. <br />
                            <br />
                            - Lenssen, N., G.A. Schmidt, M. Hendrickson, P. Jacobs, M. Menne, and R. Ruedy, 2024: A GISTEMPv4 observational uncertainty ensemble. J. Geophys. Res. Atmos., 129, no. 17, e2023JD040179, doi:10.1029/2023JD040179.
                        </Typography>
                        <Link 
                            href="https://data.giss.nasa.gov/gistemp/"
                            target="_blank"
                            rel="noreferrer">
                                Visit NASA Data
                        </Link>
                    </Paper>
                </Grid>

                {/* grid section for the api provider */}
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Global Warming and Climate Change API</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            This site provides easy to read JSON APIs from trusted sources such as NASA and NOAA.
                        </Typography>
                        <Link 
                            href="https://global-warming.org/"
                            target="_blank"
                            rel="noreferrer">
                                Visit Global Warming and Climate Change API
                            </Link>
                    </Paper>
                </Grid>

                {/* grid section for the glacier mass loss data source(s) */}
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Glacier Mass Loss Trends</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Global glacier mass loss trends have been collected from the World Glacier Monitoring Service (WGMS). 
                            The data reported is measured as m.w.e or meters water equivalent.<br />
                            The data we provide can be read as "0.XXX" meters or XXX,000 cubic meters of water equivalent lossed/gained. Values are recorded in yearly increments only.<br/> <br/>
                            - The GlaMBIE Team (2024): Glacier Mass Balance Intercomparison Exercise (GlaMBIE) Dataset 1.0.0. World Glacier Monitoring Service (WGMS), Zurich, Switzerland. https://doi.org/10.5904/wgms-glambie-2024-07
                        </Typography>
                        <Link
                            href="https://doi.org/10.5904/wgms-glambie-2024-07"
                            target="_blank"
                            rel="noreferrer">
                                Visit WGMS Data
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