export async function getDashboardData() {
  // later: fetch real data; for now return mock in the same shape
  return {
    co2Series: [],
    tempSeriesC: [],
    glacierIndex: [],
    updatedAt: new Date().toISOString(),
  };
}
