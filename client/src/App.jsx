import { Routes, Route } from "react-router-dom";
import TopBar from "./components/Navigation/TopBar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import MapPage from "./pages/MapPage";

console.log("📦 App.jsx loaded");

export default function App() {
  console.log("🏗️ App component rendering...");
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  );
}
