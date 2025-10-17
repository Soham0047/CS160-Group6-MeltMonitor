import { Routes, Route } from "react-router-dom";
import TopBar from "./components/Navigation/TopBar.jsx";
import DashboardPage from "./components/Dashboard/DashboardPage.jsx";
import MapPage from "./pages/MapPage.jsx";

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/sources"
          element={<div style={{ padding: 24 }}>Sources coming soon</div>}
        />
      </Routes>
    </>
  );
}
