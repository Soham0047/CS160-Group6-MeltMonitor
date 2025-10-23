export async function getDashboardData() {
  // later: fetch real data; for now return mock in the same shape
  return {
    co2Series: [],
    tempSeriesC: [],
    glacierIndex: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getJSON(url) {
  const connect = await fetch(url);
  if (!connect.ok)
    throw new Error("Failed to connect")
  return await connect.json();
}
