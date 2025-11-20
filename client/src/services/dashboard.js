// fetch data for each statistic we want to display on the dashboard
async function fetchCO2Data() {
  try {
    const connection = await fetch('https://global-warming.org/api/co2-api');
    if (!connection.ok) {
      throw new Error('Failed data fetch');
    }

    const co2Data = await connection.json();

    // fetch last 28 (4 weeks) for trend calculations
    const latest = co2Data.co2.slice(-28);
    const co2Series = latest.map(entry => parseFloat(entry.trend));

    return co2Series;
    // throw new Error('No API');
  }
  catch (e) {
    console.error('Error: CO2 data fetch has failed');
    // in the event API fetch has failed, use mock data for filler
    return Array.from({ length: 28 }, (_,i) =>
    420 + Math.sin((i + 1) / 2) * 3);
  }
}

async function fetchTempData() {
  try {
    const connection = await fetch('https://global-warming.org/api/temperature-api');
    if (!connection.ok) {
      throw new Error('Failed data fetch');
    }
    
    const tempData = await connection.json();

    // fetch the last 12 months for trend calculations
    const latest = tempData.result.slice(-12);
    // add global temp baseline to anomaly entry for celcius format
    const tempSeries = latest.map(entry => 14 + parseFloat(entry.land));

    return tempSeries;

  }
  catch (e) {
    console.error('Error: Temp data fetch has failed');
    return Array.from({ length: 12 }, (_,i) =>
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

// find and note the percent change between previous and current data
function calculateDiff(series) {
  const current = series[series.length - 1];
  const previous = series[series.length - 2];

  const diff = ((current - previous) / previous) * 100;
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
