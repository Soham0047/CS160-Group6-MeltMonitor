import {
    Container,
    Paper,
    Typography,
    Link,
    Grid,
    Box,
    Fade,
    Grow
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";

export default function SourcesPage() {
    const sources = [
        {
            title: "NOAA CO₂ Trends ",
            desc: "Atmospheric CO₂ data collected daily by NOAA.",
            link: "https://gml.noaa.gov/ccgg/trends/gl_trend.html",
            linkText: "Visit NOAA Data",
        },
        {
            title: "Annual CO₂ Emissions (per country)",
            desc: "Provided by Our World in Data. Includes global and country totals.",
            link: "https://ourworldindata.org/grapher/annual-co2-emissions-per-country",
            linkText: "Visit OWID Annual CO₂ Data",
        },
        {
            title: "CO₂ Emissions Per Capita",
            desc: "OWID dataset for CO₂ emissions per person by country.",
            link: "https://ourworldindata.org/grapher/co-emissions-per-capita",
            linkText: "Visit Per-Capita CO₂ Data",
        },
        {
            title: "OWID CO₂ + GHG Dataset",
            desc: "Comprehensive CO₂ + GHG dataset (one row per country-year).",
            link: "https://github.com/owid/co2-data",
            linkText: "Visit OWID GitHub Dataset",
        },
        {
            title: "World Bank CO₂ (AR5)",
            desc: "World Bank climate dataset EN.GHG.CO2.PC.CE.AR5.",
            link: "https://data.kapsarc.org/",
            linkText: "Visit World Bank Dataset",
        },
        {
            title: "Historical CO₂ Emissions 1960–2018",
            desc: "World Bank historical CO₂ emissions (fossil fuel + cement).",
            link: "https://www.rpubs.com/ErdalAndrewTom/WorldCountriesCO2Emission",
            linkText: "Visit Historical Data",
        },
        {
            title: "NASA GISTEMP",
            desc: "Global surface temperature dataset from NASA GISS.",
            link: "https://data.giss.nasa.gov/gistemp/",
            linkText: "Visit NASA Data",
        },
        {
            title: "Global Warming API",
            desc: "JSON APIs from trusted sources such as NASA and NOAA.",
            link: "https://global-warming.org/",
            linkText: "Visit API",
        },
        {
            title: "WGMS Glacier Mass Loss",
            desc: "Global glacier mass balance dataset in meters water equivalent.",
            link: "https://doi.org/10.5904/wgms-glambie-2024-07",
            linkText: "Visit WGMS Data",
        },
        {
            title: "Country Boundaries GeoJSON",
            desc: "Natural Earth polygons with ISO codes for mapping.",
            link: "https://datahub.io/core/geo-countries",
            linkText: "Visit Natural Earth Data",
        },
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                pb: 6,
            }}
        >
            {/* HEADER SECTION */}
            <Fade in timeout={800}>
                <Box
                    sx={{
                        background:
                            "linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)",
                        backdropFilter: "blur(20px)",
                        py: 6,
                        mb: 4,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                            <PublicIcon sx={{ fontSize: 48, color: "white" }} />
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    color: "white",
                                    textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                                }}
                            >
                                Data Sources
                            </Typography>
                        </Box>

                        <Typography
                            variant="h6"
                            sx={{
                                color: "rgba(255,255,255,0.9)",
                                fontWeight: 400,
                                maxWidth: "800px",
                            }}
                        >
                            These are our trusted, verified scientific datasets powering MeltMonitor.
                        </Typography>
                    </Container>
                </Box>
            </Fade>

            {/* MAIN CONTENT */}
            <Container maxWidth="lg">
                <Grow in timeout={1000}>
                    <Grid container spacing={3}>
                        {sources.map((item, i) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        height: "100%",                     // equal height
                                        display: "flex",                    // flexbox for equal sizing
                                        flexDirection: "column",
                                        justifyContent: "space-between",    // push link to bottom
                                        background: "rgba(255,255,255,0.95)",
                                        borderRadius: 3,
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {item.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 1 }}
                                        >
                                            {item.desc}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Link
                                            href={item.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            sx={{
                                                fontWeight: 600,
                                                textDecoration: "none",
                                                color: "#5b3ea6",
                                                "&:hover": { textDecoration: "underline" },
                                            }}
                                        >
                                            {item.linkText}
                                        </Link>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grow>

                {/* FOOTER */}
                <Fade in timeout={1500}>
                    <Box sx={{ mt: 4, p: 2, textAlign: "center", color: "white" }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            MeltMonitor is committed to using transparent, trusted scientific
                            data. More sources will be added as our platform grows.
                        </Typography>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
