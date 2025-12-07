# MeltMonitor 🌍📊

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Soham0047/CS160-Group6-MeltMonitor)

A comprehensive, open-source climate monitoring dashboard that visualizes global CO₂ emissions, temperature trends, and glacier mass loss with interactive maps, AI-powered predictions, **Google OAuth authentication**, and a full-featured **Learning Center**. Built for students, educators, researchers, and anyone interested in understanding climate data.

![MeltMonitor Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![MUI](https://img.shields.io/badge/MUI-7.x-007FFF?logo=mui)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

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

### 🎓 Learning Center (NEW!)

| Feature                 | Description                               |
| ----------------------- | ----------------------------------------- |
| **Interactive Quizzes** | Adaptive climate quizzes with XP rewards  |
| **Study Streaks**       | Track daily learning with streak bonuses  |
| **Daily Climate Terms** | Learn new vocabulary every day            |
| **Badge System**        | Earn achievements and milestones          |
| **Goal Tracker**        | Set and track personalized learning goals |
| **Carbon Calculator**   | Calculate your personal carbon footprint  |
| **Country Comparison**  | Compare emissions with 5-year CAGR trends |
| **Quick Compare**       | Side-by-side country analysis             |
| **Saved Views**         | Save favorite countries for quick access  |
| **AI Assistant**        | OpenAI-powered explanations and help      |

### 🔐 Authentication & User Features

- **Google OAuth 2.0** for secure sign-in
- **User-isolated data** - each user's progress is saved separately
- **Profile page** with learning stats, saved views, and settings
- **Persistent progress** across sessions and devices

### 📚 Data Sources Page

- Curated list of 10+ verified scientific data sources
- Direct links to NOAA, NASA GISTEMP, OWID, WGMS, and more

---

## 🛠️ Tech Stack

| Category            | Technologies                                        |
| ------------------- | --------------------------------------------------- |
| **Frontend**        | React 19, Vite 5, React Router 7                    |
| **UI Framework**    | Material UI (MUI) 7, MUI X Charts                   |
| **Backend**         | Express.js, Node.js 18+                             |
| **Database**        | SQLite (better-sqlite3)                             |
| **Authentication**  | Passport.js, Google OAuth 2.0, express-session, JWT |
| **Data Processing** | Papa Parse (CSV), Custom ML algorithms              |
| **Maps**            | Leaflet, React-Leaflet, GeoJSON                     |
| **AI**              | OpenAI API (optional)                               |
| **Styling**         | MUI theming, Glassmorphism, Tailwind (utilities)    |
| **Build**           | Vite, ESLint, PostCSS                               |

---

## 📁 Project Structure

```
MeltMonitor/
├── client/                              # React frontend application
│   ├── public/
│   │   └── data/                        # Static datasets
│   │       ├── annual-co2-emissions-per-country.csv
│   │       ├── co-emissions-per-capita.csv
│   │       ├── owid-co2-data.csv
│   │       ├── countries.geojson
│   │       └── ...
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation/TopBar.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── KpiCard.jsx
│   │   │   │   └── ClimateFactOfTheDay.jsx
│   │   │   ├── Map/
│   │   │   │   ├── WorldMapLocal.jsx
│   │   │   │   ├── CO2PredictionPanel.jsx
│   │   │   │   └── Legend.jsx
│   │   │   ├── Learning/                # 🎓 Learning Center
│   │   │   │   ├── QuizEngine.jsx       # Interactive quizzes
│   │   │   │   ├── StudyStreak.jsx      # Streak tracking & reminders
│   │   │   │   ├── DailyTerms.jsx       # Daily vocabulary
│   │   │   │   ├── BadgeSystem.jsx      # Achievement badges
│   │   │   │   ├── GoalTracker.jsx      # Learning goals
│   │   │   │   ├── CarbonCalculator.jsx # Footprint calculator
│   │   │   │   ├── CountryComparison.jsx# Country analysis
│   │   │   │   ├── SavedViews.jsx       # Saved favorites
│   │   │   │   └── AIFeatures.jsx       # AI assistant
│   │   │   ├── Charts/
│   │   │   │   ├── SparkLine.jsx
│   │   │   │   └── BarMini.jsx
│   │   │   └── Sources/SourcesPage.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx          # 🔐 Auth state management
│   │   ├── services/
│   │   │   ├── api.js                   # Backend API client
│   │   │   ├── localStorage.js          # User-isolated storage
│   │   │   ├── co2PredictionML.js       # ML model
│   │   │   ├── openaiService.js         # AI integration
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── MapPage.jsx
│   │   │   ├── LearnPage.jsx            # Learning Center
│   │   │   ├── ProfilePage.jsx          # User profile
│   │   │   ├── AuthPage.jsx             # Login page
│   │   │   └── AuthCallbackPage.jsx     # OAuth callback
│   │   ├── hooks/
│   │   │   └── useDashboardData.jsx
│   │   ├── data/
│   │   │   └── glossary.json            # Climate terms
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # 🖥️ Express backend
│   ├── server.js                        # Main server file
│   ├── package.json
│   ├── config/
│   │   ├── db.js                        # SQLite database setup
│   │   └── passport.js                  # Google OAuth config
│   ├── routes/
│   │   ├── auth.js                      # Auth routes
│   │   └── user.js                      # User data routes
│   └── middleware/
│       └── auth.js                      # JWT/Session middleware
│
├── docs/                                # Documentation
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **yarn**
- **Git**
- **Google Cloud Console account** (for OAuth)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Soham0047/CS160-Group6-MeltMonitor.git
cd CS160-Group6-MeltMonitor
```

### Step 2: Set Up Google OAuth (Required for Authentication)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure the consent screen if prompted
6. Set Application Type to **Web application**
7. Add Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
8. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

**Create `server/.env`:**

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Secret (generate a random string)
SESSION_SECRET=your-random-session-secret-here

# JWT Secret (generate a random string)
JWT_SECRET=your-random-jwt-secret-here

# Server Config
PORT=3001
CLIENT_URL=http://localhost:5173

# OpenAI (optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key
```

**Create `client/.env`:**

```env
# API Base URL
VITE_API_BASE=http://localhost:3001

# OpenAI (optional - for AI features)
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

### Step 4: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 5: Start the Application

**Option A: Run Both Servers (Recommended)**

Open two terminal windows:

**Terminal 1 - Backend Server:**

```bash
cd server
npm run dev
```

Server runs at `http://localhost:3001`

**Terminal 2 - Frontend Client:**

```bash
cd client
npm run dev
```

Client runs at `http://localhost:5173` (or next available port)

**Option B: Frontend Only (Limited Features)**

If you only want to run the frontend without authentication:

```bash
cd client
npm run dev
```

> ⚠️ Note: Without the backend, Google OAuth and user persistence won't work.

### Step 6: Access the Application

Open your browser and go to:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`

---

## 📋 Available Scripts

### Client (Frontend)

```bash
cd client
npm run dev       # Start development server (hot reload)
npm run build     # Build for production → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Server (Backend)

```bash
cd server
npm run dev       # Start with nodemon (auto-restart)
npm start         # Start production server
```

---

## 🌐 Deployment

### Deploy to Vercel (Frontend)

1. **Via Dashboard:**

   - Go to [vercel.com](https://vercel.com)
   - Import `Soham0047/CS160-Group6-MeltMonitor`
   - Set **Root Directory**: `client`
   - Framework: **Vite** (auto-detected)
   - Add environment variables from `client/.env`
   - Click **Deploy**

2. **Via CLI:**
   ```bash
   npm install -g vercel
   cd client
   vercel
   ```

### Deploy Backend (Railway, Render, or Fly.io)

For the backend, use a Node.js-compatible platform:

1. Connect your repository
2. Set Root Directory: `server`
3. Add environment variables from `server/.env`
4. Deploy

### Build Settings

| Component | Setting          | Value           |
| --------- | ---------------- | --------------- |
| Frontend  | Root Directory   | `client`        |
| Frontend  | Build Command    | `npm run build` |
| Frontend  | Output Directory | `dist`          |
| Backend   | Root Directory   | `server`        |
| Backend   | Start Command    | `npm start`     |

---

## 🗄️ Database

MeltMonitor uses **SQLite** for user data storage. The database is automatically created on first server start.

**Tables:**

- `users` - User accounts (Google OAuth)
- `sessions` - Express sessions
- `user_preferences` - User settings and preferences
- `learning_progress` - Quiz progress and XP
- `badges` - Earned achievements
- `goals` - Learning goals

The database file (`meltmonitor.db`) is stored in the `server/` directory and is gitignored.

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

- **Glassmorphism design**: Modern transparent cards with blur effects
- **Purple/indigo gradient theme**: Professional, cohesive aesthetic
- **Responsive design**: Works on desktop, tablet, and mobile
- **Smooth animations**: Fade/grow transitions on page load
- **Interactive elements**: Hover effects, tooltips, clickable regions
- **Accessibility**: Keyboard navigation, ARIA labels
- **User-isolated data**: Each user's progress saved separately

---

## 🔧 Advanced Configuration

### Environment Variables Reference

#### Server (`server/.env`)

| Variable               | Required | Description                                   |
| ---------------------- | -------- | --------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | ✅       | Google OAuth Client ID                        |
| `GOOGLE_CLIENT_SECRET` | ✅       | Google OAuth Client Secret                    |
| `SESSION_SECRET`       | ✅       | Random string for session encryption          |
| `JWT_SECRET`           | ✅       | Random string for JWT signing                 |
| `PORT`                 | ❌       | Server port (default: 3001)                   |
| `CLIENT_URL`           | ❌       | Frontend URL (default: http://localhost:5173) |
| `OPENAI_API_KEY`       | ❌       | OpenAI API key for AI features                |

#### Client (`client/.env`)

| Variable              | Required | Description                    |
| --------------------- | -------- | ------------------------------ |
| `VITE_API_BASE`       | ✅       | Backend API URL                |
| `VITE_OPENAI_API_KEY` | ❌       | OpenAI API key for AI features |

### Generating Secrets

```bash
# Generate random secrets for SESSION_SECRET and JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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

## ❓ Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Find and kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Or use a different port
PORT=3002 npm run dev
```

**Google OAuth not working:**

1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
2. Check redirect URI matches exactly: `http://localhost:3001/auth/google/callback`
3. Ensure OAuth consent screen is configured in Google Cloud Console

**Database errors:**

```bash
# Delete and recreate database
rm server/meltmonitor.db
npm run dev  # Will recreate automatically
```

**Frontend can't connect to backend:**

1. Make sure backend is running on port 3001
2. Check `VITE_API_BASE` is set to `http://localhost:3001`
3. Verify CORS is enabled (already configured in server.js)

**Client running on different port (e.g., 5174):**

- This happens when 5173 is in use
- Update `CLIENT_URL` in `server/.env` if needed

---

## 📝 License

This project is developed for **SJSU CS160** (Software Engineering) course.

---

## 👥 Team

**CS160 Group 6** - San José State University, Spring 2025

---

## 🙏 Acknowledgments

- [Our World in Data](https://ourworldindata.org/) for comprehensive CO₂ datasets
- [NOAA Global Monitoring Laboratory](https://gml.noaa.gov/) for atmospheric data
- [NASA GISS](https://data.giss.nasa.gov/) for temperature records
- [WGMS](https://wgms.ch/) for glacier monitoring data
- [Natural Earth](https://www.naturalearthdata.com/) for geographic data
- [Google Cloud](https://cloud.google.com/) for OAuth 2.0 authentication
- [OpenAI](https://openai.com/) for AI-powered features

---

<p align="center">
  Made with 💚 for a sustainable future
</p>
