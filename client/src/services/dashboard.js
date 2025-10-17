// src/services/dashboard.js
export async function fetchDashboard() {
  // later: real fetch. For now mock in same shape:
  return {
    co2Series: [
      /* numbers */
    ],
    tempSeriesC: [
      /* numbers */
    ],
    glacierIdx: [
      /* numbers */
    ],
    updatedAt: new Date().toISOString(),
  };
}
