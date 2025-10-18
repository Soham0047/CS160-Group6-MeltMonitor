# MeltMonitor 🌎📊

A lightweight, open, web-based dashboard that helps students, teachers, and community groups explore climate indicators (CO₂, temperature, glacier mass) with clear visuals and verified sources.

> **Project status**
>
> - **main** – Starter dashboard: TopBar, KPI tiles, simple charts, map placeholder, routes, and a clean MUI theme.
> - **feat/map-page** – Active branch for the **real Map** (Leaflet + OSM). **Not merged yet** so others can safely branch from main.

## Tech Stack

- **React + Vite** (fast dev server & build)
- **MUI** (Material UI) for components & theming
- **MUI X Charts** for lightweight charts
- **React Router** for routing
- **(Map branch)** react-leaflet + leaflet for the map
- **Tailwind (optional utilities)** — see Tailwind note below

## Repo Layout

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  client/                   # React app    src/      App.jsx      main.jsx      index.css      components/        Navigation/TopBar.jsx        Dashboard/          DashboardPage.jsx          KpiCard.jsx          WorldMapPlaceholder.jsx        Charts/          SparkLine.jsx          BarMini.jsx      pages/        MapPage.jsx         # on feat/map-page only      hooks/        useDashboardData.jsx      services/        dashboard.js        dataClient.js    index.html    package.json  README.md  `

> Map work stays in feat/map-page. Everyone else should branch off main.

## Getting Started (Local Dev)

**Prereqs**

- Node.js 20+ (node -v)
- npm (npm -v)
- Git

**Install & Run**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  git clone https://github.com/Soham0047/CS160-Group6-MeltMonitor.git  cd CS160-Group6-MeltMonitor/client  npm install  npm run dev  `

Vite prints a local URL (e.g., http://localhost:5173). If that port is busy, it will use another (e.g., 5174).

**Common Scripts**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  npm run dev       # start local dev server  npm run build     # production build -> dist/  npm run preview   # preview built app  `

## Tailwind Note (Only If You Use It)

We rely on MUI for most UI. Tailwind utilities are optional.

**If using Tailwind v4**

- client/postcss.config.js

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  export default { plugins: { '@tailwindcss/postcss': {} } }  `

- client/src/index.css

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  @tailwind base;  @tailwind components;  @tailwind utilities;  `

- Ensure import './index.css' exists at the top of src/main.jsx.

**If using Tailwind v3**

- postcss.config.cjs

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }  `

- tailwind.config.cjs

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  module.exports = {    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],    theme: { extend: {} },    plugins: []  }  `

## Environment Variables

Create client/.env (do **not** commit it):

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  VITE_API_BASE=https://api.example.com  `

Add more keys as we wire real APIs. Keep client/.env.example up to date.

## What’s Already Built (on main)

- **TopBar** with routes: /, /map, /sources
- **Dashboard** page:

  - KPI cards (CO₂, Temp with °C/°F toggle, Glacier Index)
  - Two sparkline charts + one mini bar chart (mock data)
  - Map placeholder panel
  - Source links area (NOAA, NASA GISTEMP)

- **Theme** with light/dark mode toggle (via context)

Key files:

- src/components/Navigation/TopBar.jsx
- src/components/Dashboard/DashboardPage.jsx
- src/components/Charts/\*
- src/main.jsx (theme + router + dark mode)

## Working on a Feature (Branching Guide)

1.  git checkout maingit pull
2.  git checkout -b feat/\# e.g., feat/unit-toggle, feat/sources-links, feat/ci
3.  git add .git commit -m "feat(unit-toggle): add °C/°F toggle to temperature card"git push -u origin feat/unit-toggle
4.  **Open a Pull Request** into main (keep PRs small and focused).

> **Map work continues on feat/map-page**. Please do not merge that branch yet; open separate feature branches from main for unrelated work.

## If You’re Working on the Map (only on feat/map-page)

**Install**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  cd client  npm i react-leaflet leaflet  `

**Leaflet CSS** (in client/index.html )

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML

`href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="    crossorigin="" />`

**Files**

- src/pages/MapPage.jsx
- src/components/Map/WorldMap.jsx

**Run**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  npm run dev  # go to /map  `

**Do not merge** this branch yet. We’ll PR when it’s ready.

## Coding Standards

- **Components:** small & focused; layout in pages, data/logic in hooks/services
- **Styling:** prefer MUI props/styles; Tailwind only for quick utilities
- **Accessibility:** visible keyboard focus; aria-label on icon-only buttons
- **Performance:** memoize static arrays; avoid re-creating large data each render
- **Security basics (front-end):** no secrets in code; avoid localStorage for auth tokens (when we add auth)

## Backlog Alignment (Sprint 1 targets on main)

- Top nav, Dashboard shell, °C/°F toggle ✅
- Source links ✅
- Data/service stubs ready to swap in real APIs ✅
- CI/lint/test — add as we go

## Lint, Tests, CI (Add as Needed)

Install:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  npm i -D eslint prettier eslint-config-prettier vitest jsdom @testing-library/react @testing-library/jest-dom  `

Sample scripts (add to client/package.json):

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  {    "scripts": {      "dev": "vite",      "build": "vite build",      "preview": "vite preview",      "lint": "eslint . --ext .js,.jsx",      "test": "vitest run",      "test:ui": "vitest"    }  }  `

## Troubleshooting

- **Blank screen** → check DevTools Console:

  - Missing import / wrong path or filename **case**
  - Running in the wrong folder (client/ is the app)
  - Tailwind v4 vs v3 PostCSS plugin mismatch (see Tailwind note)

- **Port already in use** → Vite auto-picks a new one; check terminal output.

## Contributing Workflow (Short Version)

1.  Branch off main
2.  Make small, reviewable commits
3.  Open PR → request review
4.  Address comments → merge (squash)
5.  Delete the feature branch

> **Rule:** keep main always buildable.

## License

Academic/educational use for SJSU CS160. (Add a LICENSE file if required.)

### How to Add This README to main (now)

You’re on the map branch. To update main:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`  git checkout main  git pull  # create/overwrite README.md with this content (paste in VS Code, save)  git add README.md  git commit -m "docs: add project README with setup, workflow, and map branch notes"  git push  `

Teammates can now git pull on main and start working on features immediately.
