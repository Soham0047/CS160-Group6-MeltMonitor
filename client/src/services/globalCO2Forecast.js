const GLOBAL_CO2_URL = "/data/co2-api.json";

async function fetchJSON(url) {
  console.log("🌐 Fetching:", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log("✅ Fetched successfully, data keys:", Object.keys(data));
  return data;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function fetchGlobalCO2Series() {
  console.log("📈 fetchGlobalCO2Series: Starting...");
  const payload = await fetchJSON(GLOBAL_CO2_URL);
  console.log("📈 Payload structure:", {
    hasCo2: !!payload?.co2,
    isArray: Array.isArray(payload?.co2),
    length: payload?.co2?.length,
  });
  const rows = Array.isArray(payload?.co2) ? payload.co2 : [];

  if (rows.length === 0) {
    console.warn("⚠️ No CO2 data found in JSON file");
    throw new Error("CO2 data file is empty or invalid");
  }

  const parsed = rows
    .map((row) => {
      const year = toNumber(row.year);
      const month = toNumber(row.month);
      const day = toNumber(row.day);
      const ppm = toNumber(row.trend ?? row.cycle);
      if (!ppm || !year || !month || !day) {
        return null;
      }
      const date = new Date(year, month - 1, day);
      return { date, year, ppm };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  console.log("📈 Parsed CO2 series:", parsed.length, "data points");
  return parsed;
}

export function buildAnnualAverages(series) {
  const totals = new Map();
  series.forEach(({ year, ppm }) => {
    if (!totals.has(year)) {
      totals.set(year, { sum: 0, count: 0 });
    }
    const bucket = totals.get(year);
    bucket.sum += ppm;
    bucket.count += 1;
  });
  return Array.from(totals.entries())
    .map(([year, { sum, count }]) => ({
      year,
      ppm: count ? sum / count : null,
    }))
    .filter((d) => d.ppm != null)
    .sort((a, b) => a.year - b.year);
}

export function runLinearRegression(dataPoints) {
  const n = dataPoints.length;
  if (!n) {
    return { slope: 0, intercept: 0, r2: 0 };
  }
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  dataPoints.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = n ? (sumY - slope * sumX) / n : 0;

  const meanY = sumY / n || 0;
  let ssTot = 0;
  let ssRes = 0;
  dataPoints.forEach(({ x, y }) => {
    const predicted = slope * x + intercept;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - predicted) ** 2;
  });
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

export function buildForecast(annualSeries, model, yearsAhead = 25) {
  if (!annualSeries.length) return [];
  const lastYear = annualSeries[annualSeries.length - 1].year;
  const forecast = [];
  for (let i = 1; i <= yearsAhead; i += 1) {
    const year = lastYear + i;
    const ppm = model.slope * year + model.intercept;
    forecast.push({ year, ppm });
  }
  return forecast;
}

export async function getGlobalCO2Forecast(yearsAhead = 25) {
  const series = await fetchGlobalCO2Series();
  const annual = buildAnnualAverages(series);
  const regression = runLinearRegression(
    annual.map(({ year, ppm }) => ({ x: year, y: ppm }))
  );
  const forecast = buildForecast(annual, regression, yearsAhead);
  return { series, annual, forecast, regression };
}
