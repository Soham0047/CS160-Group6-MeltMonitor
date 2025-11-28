import { Routes, Route } from "react-router-dom";
import TopBar from "./components/Navigation/TopBar";
import DashboardPage from "./components/Dashboard/DashboardPage";
import SourcesPage from "./components/Sources/SourcesPage"
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/sources" element={<SourcesPage />} />
      </Routes>
    </>
  );
}
