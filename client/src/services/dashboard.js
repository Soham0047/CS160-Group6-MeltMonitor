// fetch data for each statistic we want to display on the dashboard
import Papa from 'papaparse';

async function fetchCO2Data() {
  try {
    const connection = await fetch('https://global-warming.org/api/co2-api');
    if (!connection.ok) {
      throw new Error('Failed data fetch, API could not be reached');
    }

    const co2Data = await connection.json();

    // fetch last 28 (4 weeks) for trend calculations
    const latest = co2Data.co2.slice(-28);
    const co2Series = latest.map(entry => parseFloat(entry.trend));

    return co2Series;
    // throw new Error('No API');
  }
  catch (e) {
    console.error('Error: CO2 data fetch has failed, using mock data');
    // in the event API fetch has failed, use mock data for filler
    return Array.from({ length: 28 }, (_,i) =>
    420 + Math.sin((i + 1) / 2) * 3);
  }
}

async function fetchTempData() {
  try {
    const connection = await fetch('https://global-warming.org/api/temperature-api');
    if (!connection.ok) {
      throw new Error('Failed data fetch, API could not be reached');
    }
    
    const tempData = await connection.json();

    // fetch the last 12 months for trend calculations
    const latest = tempData.result.slice(-12);
    // add global temp baseline to anomaly entry for celcius format
    const tempSeries = latest.map(entry => 14 + parseFloat(entry.land));

    return tempSeries;

  }
  catch (e) {
    console.error('Error: Temp data fetch has failed, using mock data');
    return Array.from({ length: 12 }, (_,i) =>
    14 + Math.cos((i + 1) / 3) * 0.3);
  }
}

async function fetchGlacierData() {
  try {
    const connection = await fetch('/0_global.csv');
    if (!connection.ok) {
      throw new Error('Failed data fetch, csv file could not be reached');
    }

    const glacier_csv = await connection.text();

    // use papaparse to read through csv
    const glacierData = Papa.parse(glacier_csv, {
      // treat first row as header row
      header: true,
      // automatically convert from string to number
      dynamicTyping: true,
      skipEmptyLines: true
    });

    // take the last 24 years for trend 
    const trend = glacierData.data.slice(-24);

    // get massLoss value from each object provided in trend by papaparse
    const glacierSeries = trend.map(row => {
      const massLoss = row['combined_mwe'];
      return Math.round(massLoss * 1000) / 1000;
    });

    return glacierSeries;
    // throw new Error('No API');
  }
  catch (e) {
    console.error('Error: Glacier data fetch has failed, using mock data');
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

// tracking the last stored values to prevent duplicates
let lastStored = { co2: null, temp: null };

// Store data in database
async function storeData(co2, temp) {
  // Skip if same values were just stored
  if (lastStored.co2 === co2 && lastStored.temp === temp) {
    return;
  }
  
  try {
    await fetch('http://localhost:3001/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ co2, temp })
    });
    lastStored = { co2, temp };
  } catch (e) {
    console.error('Failed to store data:', e);
  }
}

// src/services/dashboard.js
export async function fetchDashboard() {
  // gather all 3 statistics at the same time
  const [co2Series, tempSeries, glacierIndex] = await Promise.all([
    fetchCO2Data(),
    fetchTempData(),
    fetchGlacierData()
  ]);
  
  // Store latest values in database
  const latestCo2 = co2Series[co2Series.length - 1];
  const latestTemp = tempSeries[tempSeries.length - 1];
  storeData(latestCo2, latestTemp);
    
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
