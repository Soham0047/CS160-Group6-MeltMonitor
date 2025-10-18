# MeltMonitor 🌎📊

A lightweight, open, web-based dashboard that lets students, teachers, and community groups explore climate indicators (CO₂, temperature, glacier mass) with clear visuals and verified sources.

## Project Status

- **main**: ships the starter dashboard — TopBar, KPI tiles, simple charts, map placeholder, routes, and a clean MUI theme.
- **feat/map-page**: active branch for the real Map (Leaflet + OSM). Not merged yet by design so others can work on different features from main.

## Tech Stack

- React + Vite (fast dev server & build)
- MUI (Material UI) for components & theming
- MUI X Charts for simple, lightweight charts
- React Router for routing
- (Map branch) react-leaflet + leaflet for the map
- Tailwind (optional utilities) — see Tailwind note below

## Repo Layout

```
client/                   # React app
  src/
    App.jsx
    main.jsx
    index.css
    components/
      Navigation/TopBar.jsx
      Dashboard/
        DashboardPage.jsx
        KpiCard.jsx
        WorldMapPlaceholder.jsx
      Charts/
        SparkLine.jsx
        BarMini.jsx
    pages/
      MapPage.jsx         # on feat/map-page only
    hooks/
      useDashboardData.jsx
    services/
      dashboard.js
      dataClient.js
  index.html
  package.json
README.md
```

We keep map work isolated in `feat/map-page`. Everyone else should branch off `main` for their features.

## Getting Started (Local Dev)

### Prerequisites

- Node.js 20+ (`node -v`)
- npm (`npm -v`)
- Git

### Install & Run

```bash
git clone https://github.com/Soham0047/CS160-Group6-MeltMonitor.git
cd CS160-Group6-MeltMonitor/client
npm install
npm run dev
```

Vite will print a local URL (e.g., `http://localhost:5173`). If the port is taken, it auto-picks another (e.g., 5174).

### Common Scripts

```bash
npm run dev       # start local dev server
npm run build     # production build -> dist/
npm run preview   # preview built app
```

## Tailwind Note (Only if You Use Tailwind Utilities)

We use MUI for most UI, but Tailwind is allowed for small utility spacing if you like. You may be on Tailwind v4 (new plugin) or v3 (classic). Either is fine; be consistent.

### If Tailwind v4

**client/postcss.config.js**

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

**client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Ensure `import './index.css'` exists at the top of `src/main.jsx`.

### If Tailwind v3

**postcss.config.cjs**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

**tailwind.config.cjs**

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

## Environment Variables

Create `client/.env` (do not commit it):

```
VITE_API_BASE=https://api.example.com
```

Add new keys as we wire real APIs. Keep `client/.env.example` up-to-date.

## What's Already Built (on main)

- **TopBar** with routes: `/`, `/map`, `/sources`
- **Dashboard page**:
  - KPI cards (CO₂, Temp with °C/°F toggle, Glacier Index)
  - Two sparkline charts + one mini bar chart (mock data)
  - Map placeholder panel
  - Source links area (NOAA, NASA GISTEMP)
- **Theme** with light/dark mode toggle (via context)

**Open files**:

- `src/components/Navigation/TopBar.jsx`
- `src/components/Dashboard/DashboardPage.jsx`
- `src/components/Charts/*`
- `src/main.jsx` (theme + router + dark mode)

## How to Work on a Feature (Branching Guide)

### 1. Sync main

```bash
git checkout main
git pull
```

### 2. Create Your Feature Branch

```bash
git checkout -b feat/<short-name>
# example: feat/unit-toggle, feat/sources-links, feat/ci
```

### 3. Code → Commit → Push

```bash
git add .
git commit -m "feat(unit-toggle): add °C/°F toggle to temperature card"
git push -u origin feat/unit-toggle
```

### 4. Open a Pull Request into main

Keep PRs small and focused (≤ ~300 lines if possible).

**Note**: Map work continues on `feat/map-page`. Please do not merge that branch yet; open separate feature branches from `main` for unrelated work.

## If You're Working on the Map (Only on feat/map-page)

### Deps

```bash
cd client
npm i react-leaflet leaflet
```

### Leaflet CSS (in client/index.html `<head>`)

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
```

### Files

- `src/pages/MapPage.jsx`
- `src/components/Map/WorldMap.jsx`

### Run

```bash
npm run dev
# go to /map
```

**Do not merge this branch yet.** We'll open a PR when it's ready for review.

## Coding Standards

- **Components**: small, focused; keep layout in pages, logic in hooks/services.
- **Styling**: use MUI props/styling; Tailwind only for quick utilities.
- **Accessibility**: keyboard focus visible; aria-labels on icon buttons.
- **Performance**: memoize static arrays; avoid re-creating large data on each render.
- **Security basics (front-end)**: no secrets in code; don't use localStorage for auth tokens (when we add auth).

## Backlog Alignment (Sprint-1 Targets Already in main)

- ✅ Top nav, Dashboard shell, °C/°F toggle
- ✅ Source links area
- ✅ Data/service stubs (ready to swap in real APIs)
- CI/lint/test — add as you go (see below)

## Lint, Tests, CI (Add as Needed)

You can add these if not already present:

```bash
npm i -D eslint prettier eslint-config-prettier vitest jsdom @testing-library/react @testing-library/jest-dom
```

### Sample Scripts

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext .js,.jsx",
  "test": "vitest run",
  "test:ui": "vitest"
}
```

## Troubleshooting

**Blank screen** → check DevTools Console:

- Missing import / wrong path or filename case
- Not running in `client/` folder
- Tailwind v4 vs v3 PostCSS plugin mismatch (see Tailwind note)

**Port already in use** → Vite auto-picks a new one; check the terminal output.

## Contributing Workflow (Short Version)

1. Branch off `main`.
2. Make small, reviewable commits.
3. Open PR → request review.
4. Address comments → merge squash.
5. Delete the feature branch.

**Rule**: keep `main` always buildable.

## License

Academic/educational use for SJSU CS160. (Add a LICENSE file if required.)
