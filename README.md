# MeltMonitor 🌍📊

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Soham0047/CS160-Group6-MeltMonitor)

A comprehensive, open-source climate monitoring dashboard that visualizes global CO₂ emissions, temperature trends, and glacier mass loss with interactive maps and AI-powered predictions. Built for students, educators, researchers, and anyone interested in understanding climate data.

![MeltMonitor Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![MUI](https://img.shields.io/badge/MUI-6.x-007FFF?logo=mui)

---

## ✨ Features

### 🗺️ Interactive World Map

- **Choropleth visualization** of CO₂ emissions by country (1949-2024)
- **Dual metrics**: Toggle between total emissions (Gt) and per-capita emissions (t/person)
- **Time slider**: Explore 75+ years of historical data
- **Country details**: Click any country to see detailed emissions data
- **GeoJSON rendering** with 258 country boundaries

### 🤖 AI-Powered Predictions (Ensemble ML)

- **10-year forecast** (2025-2034) using ensemble machine learning
- **4 algorithms combined**:
  - Linear Regression (trend analysis)
  - Polynomial Regression (degree 2, captures curves)
  - Exponential Smoothing (α=0.3, recent weight)
  - Moving Average with Trend (10-year window)
- **Performance metrics**: R² > 97%, MAPE < 2.5%
- **Confidence levels**: High/Medium/Low based on model agreement
- **Dynamic weighting**: Models weighted by accuracy (R² + inverse MAPE)

### 📊 Real-Time Dashboard

- **Live CO₂ levels** from NOAA Global Monitoring Lab
- **Global temperature anomaly** with °C/°F toggle
- **Glacier mass loss** tracking (WGMS data)
- **Trend sparklines** and mini bar charts
- **KPI cards** with change indicators

### 📚 Data Sources Page

- Curated list of 10+ verified scientific data sources
- Direct links to NOAA, NASA GISTEMP, OWID, WGMS, and more

---

## 🛠️ Tech Stack

| Category            | Technologies                                 |
| ------------------- | -------------------------------------------- |
| **Frontend**        | React 18, Vite 5, React Router 6             |
| **UI Framework**    | Material UI (MUI) 6, MUI X Charts            |
| **Data Processing** | Papa Parse (CSV), Custom ML algorithms       |
| **Maps**            | GeoJSON, SVG-based choropleth                |
| **Styling**         | MUI theming, CSS-in-JS, Tailwind (utilities) |
| **Build**           | Vite, ESLint, PostCSS                        |

---

## 📁 Project Structure

```
MeltMonitor/
├── client/                          # React frontend application
│   ├── public/
│   │   └── data/                    # Static datasets
│   │       ├── annual-co2-emissions-per-country.csv    # 1949-2024
│   │       ├── co-emissions-per-capita.csv             # 1949-2024
│   │       ├── owid-co2-data.csv                       # OWID comprehensive
│   │       ├── countries.geojson                       # Country boundaries
│   │       └── ...                                     # Additional datasets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation/TopBar.jsx        # App navigation
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.jsx        # Main dashboard
│   │   │   │   └── KpiCard.jsx              # Metric cards
│   │   │   ├── Map/
│   │   │   │   ├── WorldMapLocal.jsx        # Interactive choropleth
│   │   │   │   ├── CO2PredictionPanel.jsx   # ML predictions UI
│   │   │   │   ├── Legend.jsx               # Map legend
│   │   │   │   └── MetricControls.jsx       # Metric toggles
│   │   │   ├── Charts/
│   │   │   │   ├── SparkLine.jsx            # Trend lines
│   │   │   │   └── BarMini.jsx              # Mini bar charts
│   │   │   └── Sources/SourcesPage.jsx      # Data sources
│   │   ├── services/
│   │   │   ├── co2PredictionML.js           # Ensemble ML model
│   │   │   ├── extendedCO2Data.js           # Extended dataset loader
│   │   │   ├── mapDataLocal.js              # Map data service
│   │   │   ├── localCO2Data.js              # Legacy data service
│   │   │   ├── owidApi.js                   # OWID API integration
│   │   │   ├── climateTraceApi.js           # Climate TRACE API
│   │   │   └── dashboard.js                 # Dashboard data service
│   │   ├── pages/
│   │   │   └── MapPage.jsx                  # Map page layout
│   │   ├── hooks/
│   │   │   └── useDashboardData.jsx         # Dashboard data hook
│   │   ├── utils/
│   │   │   └── color.js                     # Color utilities
│   │   ├── App.jsx                          # App router
│   │   ├── main.jsx                         # Entry point + theme
│   │   └── index.css                        # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                          # Backend (optional)
│   ├── server.js
│   └── package.json
├── docs/                            # Documentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Soham0047/CS160-Group6-MeltMonitor.git
cd CS160-Group6-MeltMonitor

# Install frontend dependencies
cd client
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev       # Start development server (hot reload)
npm run build     # Build for production → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Via Dashboard:**

   - Go to [vercel.com](https://vercel.com)
   - Import `Soham0047/CS160-Group6-MeltMonitor`
   - Set **Root Directory**: `client`
   - Framework: **Vite** (auto-detected)
   - Click **Deploy**

2. **Via CLI:**
   ```bash
   npm install -g vercel
   cd client
   vercel
   ```

### Build Settings

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `client`        |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

---

## 📊 Data Sources

| Dataset              | Description                | Coverage  | Source            |
| -------------------- | -------------------------- | --------- | ----------------- |
| Annual CO₂ Emissions | Total emissions by country | 1949-2024 | Our World in Data |
| Per Capita Emissions | Emissions per person       | 1949-2024 | Our World in Data |
| OWID CO₂ Dataset     | Comprehensive GHG data     | 1750-2023 | GitHub OWID       |
| World Bank CO₂       | AR5 per-capita metrics     | 1960-2020 | World Bank        |
| Countries GeoJSON    | Boundary polygons          | Current   | Natural Earth     |
| CO₂ Levels (Live)    | Atmospheric CO₂            | Real-time | NOAA GML          |
| Temperature Anomaly  | Global temp deviation      | Monthly   | NASA GISTEMP      |
| Glacier Mass Loss    | Cumulative water equiv.    | 2000-2023 | WGMS              |

---

## 🤖 ML Prediction Model

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ENSEMBLE PREDICTOR                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Linear     │  │  Polynomial  │  │   Exponential    │   │
│  │  Regression  │  │  (Degree 2)  │  │   Smoothing      │   │
│  │   ~25% wt    │  │   ~30% wt    │  │    ~25% wt       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Moving Average + Trend                   │   │
│  │                    ~20% weight                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Weights dynamically adjusted by: R² × (1 / (1 + MAPE))     │
└─────────────────────────────────────────────────────────────┘
```

### Performance Metrics

| Metric           | Value                |
| ---------------- | -------------------- |
| Training Period  | 30 years (1995-2024) |
| Ensemble R²      | 97.3%                |
| Ensemble MAPE    | 2.2%                 |
| Prediction Range | 2025-2034            |

---

## 🎨 UI/UX Features

- **Gradient theme**: Purple/indigo professional aesthetic
- **Responsive design**: Works on desktop, tablet, and mobile
- **Smooth animations**: Fade/grow transitions on page load
- **Interactive elements**: Hover effects, tooltips, clickable regions
- **Accessibility**: Keyboard navigation, ARIA labels

---

## 🔧 Configuration

### Environment Variables (Optional)

Create `client/.env`:

```env
VITE_API_BASE=https://api.example.com
```

### Tailwind (Optional Utilities)

The project uses MUI for primary styling. Tailwind is available for utility classes:

```css
/* Already configured in index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Commit** changes: `git commit -m "feat: add new feature"`
4. **Push** to branch: `git push origin feat/your-feature`
5. **Open** a Pull Request

### Coding Standards

- **Components**: Small, focused, reusable
- **Services**: Business logic separated from UI
- **Styling**: MUI sx prop preferred; Tailwind for utilities
- **Types**: JSDoc comments for complex functions

---

## 📝 License

This project is developed for **SJSU CS160** (Software Engineering) course.

---

## 👥 Team

**CS160 Group 6** - San José State University, Fall 2025

---

## 🙏 Acknowledgments

- [Our World in Data](https://ourworldindata.org/) for comprehensive CO₂ datasets
- [NOAA Global Monitoring Laboratory](https://gml.noaa.gov/) for atmospheric data
- [NASA GISS](https://data.giss.nasa.gov/) for temperature records
- [WGMS](https://wgms.ch/) for glacier monitoring data
- [Natural Earth](https://www.naturalearthdata.com/) for geographic data

---

<p align="center">
  Made with 💚 for a sustainable future
</p>
