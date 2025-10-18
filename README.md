# MeltMonitor 🌎📊

A lightweight, open, web-based dashboard that lets students, teachers, and community groups explore climate indicators (CO₂, temperature, glacier mass) with clear visuals and verified sources.

> **Project status**
>
> - **`main`**: ships the **starter dashboard** — TopBar, KPI tiles, simple charts, map placeholder, routes, and a clean MUI theme.
> - **`feat/map-page`**: active branch for the **real Map** (Leaflet + OSM). Not merged yet by design so others can work on different features from `main`.

---

## Tech stack

- **React + Vite** (fast dev server & build)
- **MUI** (Material UI) for components & theming
- **MUI X Charts** for simple, lightweight charts
- **React Router** for routing
- **(Map branch)** `react-leaflet` + `leaflet` for the map
- **Tailwind (optional utilities)** — see Tailwind note below

---

## Repo layout

`client/                   # React app   src/     App.jsx     main.jsx     index.css     components/       Navigation/TopBar.jsx       Dashboard/         DashboardPage.jsx         KpiCard.jsx         WorldMapPlaceholder.jsx       Charts/         SparkLine.jsx         BarMini.jsx     pages/       MapPage.jsx         # on feat/map-page only     hooks/       useDashboardData.jsx     services/       dashboard.js       dataClient.js   index.html   package.json README.md`

> We keep map work isolated in `feat/map-page`. Everyone else should branch off `main` for their features.

---

## Getting started (local dev)

**Prereqs**

- Node.js 20+ (`node -v`)
- npm (`npm -v`)
- Git

**Install & run**

`git clone https://github.com/Soham0047/CS160-Group6-MeltMonitor.git cd CS160-Group6-MeltMonitor/client npm install npm run dev`

Vite will print a local URL (e.g., `http://localhost:5173`). If the port is taken, it auto-picks another (e.g., `5174`).

**Common scripts**

`npm run dev       # start local dev server npm run build     # production build -> dist/ npm run preview   # preview built app`

---

## Tailwind note (only if you use Tailwind utilities)

We use MUI for most UI, but Tailwind is allowed for small utility spacing if you like. You may be on **Tailwind v4** (new plugin) or **v3** (classic). Either is fine; be consistent.

**If Tailwind v4**

- `client/postcss.config.js`

`export default { plugins: { '@tailwindcss/postcss': {} } }`

- `client/src/index.css`

`@tailwind base; @tailwind components; @tailwind utilities;`

- Ensure `import './index.css'` exists at the top of `src/main.jsx`.

**If Tailwind v3**

- `postcss.config.cjs`

`module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`

- `tailwind.config.cjs`

`module.exports = {   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],   theme: { extend: {} }, plugins: [] }`

---

## Environment variables

Create `client/.env` (do **not** commit it):

`VITE_API_BASE=https://api.example.com`

Add new keys as we wire real APIs. Keep `client/.env.example` up-to-date.

---

## What’s already built (on `main`)

- **TopBar** with routes: `/`, `/map`, `/sources`
- **Dashboard** page:

  - KPI cards (CO₂, Temp with °C/°F toggle, Glacier Index)
  - Two sparkline charts + one mini bar chart (mock data)
  - Map placeholder panel
  - Source links area (NOAA, NASA GISTEMP)

- **Theme** with light/dark mode toggle (via context)

Open files:

- `src/components/Navigation/TopBar.jsx`
- `src/components/Dashboard/DashboardPage.jsx`
- `src/components/Charts/*`
- `src/main.jsx` (theme + router + dark mode)

---

## How to work on a feature (branching guide)

1.  **Sync `main`**

`git checkout main git pull`

2.  **Create your feature branch**

`git checkout -b feat/<short-name> # example: feat/unit-toggle, feat/sources-links, feat/ci`

3.  **Code → commit → push**

`git add . git commit -m "feat(unit-toggle): add °C/°F toggle to temperature card" git push -u origin feat/unit-toggle`

4.  **Open a Pull Request** into `main`  
    Keep PRs small and focused (≤ ~300 lines if possible).

> **Map work continues on `feat/map-page`**. Please do not merge that branch yet; open separate feature branches from `main` for unrelated work.

---

## If you’re working on the map (only on `feat/map-page`)

**Deps**

`cd client npm i react-leaflet leaflet`

**Leaflet CSS** (in `client/index.html` `<head>`)

`<link rel="stylesheet"   href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"   integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="   crossorigin="" />`

**Files**

- `src/pages/MapPage.jsx`
- `src/components/Map/WorldMap.jsx`

**Run**

`npm run dev # go to /map`

**Do not merge** this branch yet. We’ll open a PR when it’s ready for review.

---

## Coding standards

- **Components**: small, focused; keep layout in pages, logic in hooks/services.
- **Styling**: use MUI props/styling; Tailwind only for quick utilities.
- **Accessibility**: keyboard focus visible; aria-labels on icon buttons.
- **Performance**: memoize static arrays; avoid re-creating large data on each render.
- **Security basics** (front-end): no secrets in code; don’t use localStorage for auth tokens (when we add auth).

---

## Backlog alignment (Sprint-1 targets already in `main`)

- Top nav, Dashboard shell, °C/°F toggle ✅
- Source links area ✅
- Data/service stubs (ready to swap in real APIs) ✅
- CI/lint/test — add as you go (see below)

---

## Lint, tests, CI (add as needed)

You can add these if not already present:

`npm i -D eslint prettier eslint-config-prettier vitest jsdom @testing-library/react @testing-library/jest-dom`

Sample scripts:

`"scripts": {   "dev": "vite",   "build": "vite build",   "preview": "vite preview",   "lint": "eslint . --ext .js,.jsx",   "test": "vitest run",   "test:ui": "vitest" }`

---

## Troubleshooting

- **Blank screen** → check DevTools Console:

  - Missing import / wrong path or filename **case**
  - Not running in `client/` folder
  - Tailwind v4 vs v3 PostCSS plugin mismatch (see Tailwind note)

- **Port already in use** → Vite auto-picks a new one; check the terminal output.

---

## Contributing workflow (short version)

1.  Branch off `main`.
2.  Make small, reviewable commits.
3.  Open PR → request review.
4.  Address comments → merge squash.
5.  Delete the feature branch.

> **Rule:** keep `main` always buildable.

---

## License

Academic/educational use for SJSU CS160. (Add a LICENSE file if required.)
