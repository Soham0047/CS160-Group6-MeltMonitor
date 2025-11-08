async function fetchCO2Data() {
  try {
    const corsProxy = 'https://corsproxy.io/?';
    const url = 'https://global-warming.org/api/co2-api';

    const connection = await fetch(corsProxy + encodeURIComponent(url));
    // const connection = await fetch('https://global-warming.org/api/co2-api');
    if (!connection.ok) {
      throw new Error('Failed data fetch');
    }
    // fetch and sort data by last 24 entries from global-warming.org
    const data = await response.json();
    const last24 = data.co2.slice(-24);
    const co2Data = last24.map(entry => parseFloat(entry.trend));

    return co2Data;
    // throw new Error('No API');
  }
  catch (e) {
    console.error('Error: CO2 data fetch has failed');
    // in the event API fetch has failed, use mock data for filler
    return Array.from({ length: 24 }, (_,i) =>
    420 + Math.sin((i + 1) / 2) * 3);
  }
}

async function fetchTempData() {
  try {
    // const connection = await fetch('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.json');
    // if (!connection.ok) {
    //   throw new Error('Failed data fetch');
    // }
    // const data = await response.json();
    // return data;
    throw new Error('No API');
  }
  catch (e) {
    console.error('Error: Temp data fetch has failed');
    return Array.from({ length: 24 }, (_,i) =>
    14 + Math.cos((i + 1) / 3) * 0.3);
  }
}

async function fetchGlacierData() {
  try {
    // const connection = await fetch('');
    // if (!connection.ok) {
    //   throw new Error('Failed data fetch');
    // }
    // const data = await response.json();
    // return data;
    throw new Error('No API');
  }
  catch (e) {
    console.error('Error: Glacier data fetch has failed');
    return Array.from({ length: 16 }, (_,i) => 
      Math.max(0,100 - (i + 9) * 2.5));
  }
}

// find and note the percent change between last and latest data
function calculateDiff(series) {
  const current = series[series.length - 1];
  const previous = series.slice(-8, -1);
  const prevAvg = previous.reduce((a,b) => a + b, 0) / previous.length;

  const diff = ((current - prevAvg) / prevAvg) * 100;
  return Math.round(diff * 100) / 100;
}

// src/services/dashboard.js
export async function fetchDashboard() {
  // gather all 3 statistics at the same time
  const [co2Series, tempSeries, glacierIndex] = await Promise.all([
    fetchCO2Data(),
    fetchTempData(),
    fetchGlacierData()
  ]);
    
  return {
    co2Series,
    tempSeries,
    glacierIndex,
    difference: {
      co2: calculateDiff(co2Series),
      temp: calculateDiff(tempSeries),
      glacier: calculateDiff(glacierIndex)
    },
    updatedAt: new Date().toISOString(),
  };
}
