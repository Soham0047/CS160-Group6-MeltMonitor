import { getJSON } from "./dataClient.js"

const co2_data = ""

const temp_data = ""

const glacier_index = ""

export async function getCO2Data() {
  const data = await getJSON(co2_data);

}

export async function getTempData() {
  const data = await getJSON(temp_data);

}

export async function getGlIndexData() {

}

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
