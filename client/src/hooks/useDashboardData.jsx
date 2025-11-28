// src/hooks/useDashboardData.jsx
import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/dashboard";

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ok = true;

    // initial fetch on start up
    fetchDashboard()
      .then((d) => ok && setData(d))
      .catch(setError)
      .finally(() => ok && setLoading(false));

    // refresh the data fetch every 24 hours
    const interval = setInterval(() => {
      fetchDashboard()
        .then((d) => ok && setData(d))
        .catch(setError);
        // set to miliseconds
    }, 1000 * 60 * 60 * 24);
    
    return () => {
      ok = false;
    };
  }, []);
  return { data, loading, error };
}
