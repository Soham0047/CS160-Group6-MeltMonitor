// src/hooks/useDashboardData.jsx
import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/dashboard";
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let ok = true;
    fetchDashboard()
      .then((d) => ok && setData(d))
      .catch(setError)
      .finally(() => ok && setLoading(false));
    return () => {
      ok = false;
    };
  }, []);
  return { data, loading, error };
}
