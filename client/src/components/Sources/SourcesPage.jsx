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

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Annual CO₂ Emissions (per country)</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Provided by Our World in Data. This dataset (includes global and country totals, with OWID_WRL for world) can be downloaded as a CSV from OWID's Grapher database. <br />
                            <br />
                            - “Data Page: Annual CO₂ emissions”, part of the following publication: Hannah Ritchie, Pablo Rosado, and Max Roser (2023) - “CO₂ and Greenhouse Gas Emissions”. Data adapted from Global Carbon Project. Retrieved from https://archive.ourworldindata.org/20251114-151001/grapher/annual-co2-emissions-per-country.html [online resource] (archived on November 14, 2025).
                        </Typography>
                        <Link
                            href="https://ourworldindata.org/grapher/annual-co2-emissions-per-country#:~:text=Annual%20CO%E2%82%82%20emissions"
                            target="_blank"
                            rel="noreferrer">
                                Visit Our World in Data Annual Data
                        </Link>
                        <br />
                        <Link
                            href="https://ourworldindata.org/grapher/annual-co2-emissions-per-country#:~:text=Source"
                            target="_blank"
                            rel="noreferrer">
                                Visit Our World in Data (per country) Data
                        </Link>
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1">CO₂ Emissions Per Capita (per country)</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Provided by Our World in Data. This dataset gives CO₂ emissions per person by country (territorial emissions, excluding land-use change).
                        </Typography>
                        <Link
                            href="https://ourworldindata.org/grapher/co-emissions-per-capita#:~:text=Source"
                            target="_blank"
                            rel="noreferrer">
                                Visit Our World in Data (per country) Data
                        </Link>
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Complete OWID CO₂ and GHG Dataset</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Our World in Data's comprehensive CO₂ and greenhouse gas emissions dataset (1 row per country-year, including co2 and co2_per_capita among many variables).
                        </Typography>
                        <Link
                            href="https://github.com/owid/co2-data#:~:text=The%20complete%20Our%20World%20in,and%20Greenhouse%20Gas%20Emissions%20dataset"
                            target="_blank"
                            rel="noreferrer">
                                Visit Our World in Data GitHub Data
                        </Link>
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> World Bank CO₂ Emissions per Capita (AR5)</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            World Bank (WDI/Climate) data for CO₂ emissions per capita, excluding land-use change (in metric tons CO₂-equivalent per person, AR5 GWP). This is available via the World Bank API/portal under indicator code EN.GHG.CO2.PC.CE.AR5.
                        </Typography>
                        <Link
                            href="https://data.kapsarc.org/explore/dataset/global-co2-emissions-total-per-capita-excluding-lulucf-world-bank/#:~:text=Global%20CO2%20Emissions%3A%20Total%20and,by%20a%20country%27s%20population%2C"
                            target="_blank"
                            rel="noreferrer">
                                Visit World Bank Data
                        </Link>
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Historical CO₂ Emissions 1960-2018 (Total)</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            World Bank (WDI) historical CO₂ emission totals by country (generally fossil fuel and cement emissions, in metric tons). This legacy dataset was often used as a fallback for older years. Link: World Bank indicator EN.ATM.CO2E.KT - e.g. accessible via WDI or Kaggle. For convenience: see Kaggle's “CO2 Emissions 1960-2018” dataset which is sourced from the World Bank.
                        </Typography>
                        <Link
                            href="https://www.rpubs.com/ErdalAndrewTom/WorldCountriesCO2Emission#:~:text=World%20Countries%20CO2%20Emission%20,the%20burning%20of%20fossil"
                            target="_blank"
                            rel="noreferrer">
                                Visit RPubs World Bank Data
                        </Link>
                    </Paper>
                </Grid>

                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Historical CO₂ Emissions 1960-2018 (Per Capita)</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            World Bank (WDI) historical CO₂ emissions per capita by country (metric tons per person). This is an alternate legacy per-capita dataset used for fallback.
                        </Typography>
                        <Link
                            href="https://www.kaggle.com/datasets/kkhandekar/co2-emissions-1960-2018/data#:~:text=CO2%20Emissions%20_%201960%20,Tasks"
                            target="_blank"
                            rel="noreferrer">
                                Visit KOUSTUBHK World Bank Data
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

                {/* grid section for the map data source(s) */}
                <Grid item xs={12} sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1"> Country Boundaries GeoJSON</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                            Natural Earth country polygons (GeoJSON format). Provides country boundaries with ISO_A3 (ISO 3166-1 alpha-3 codes) and ADMIN (country names) properties for mapping.
                        </Typography>
                        <Link
                            href="https://datahub.io/core/geo-countries#:~:text=Files%20Size%20Format%20Created%20Updated,0Natural%20Earth"
                            target="_blank"
                            rel="noreferrer">
                                Visit geoJSON Data
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