import { Routes, Route } from "react-router-dom";
import TopBar from "./components/Navigation/TopBar.jsx";
import DashboardPage from "./components/Dashboard/DashboardPage.jsx";

function Placeholder({ title }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p>Coming soon…</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/map" element={<Placeholder title="Map" />} />
        <Route path="/sources" element={<Placeholder title="Sources" />} />
      </Routes>
    </>
  );
}
