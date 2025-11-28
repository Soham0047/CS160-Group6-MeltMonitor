// Machine Learning Service for CO2 Prediction
// Uses multiple ML algorithms and ensemble methods for accurate forecasting
// Predictions start from 2025 (after dataset ends in 2024)

import { getGlobalEmissionsTrend } from "./extendedCO2Data";

/**
 * Perform linear regression on time series data
 * @param {Array<{x: number, y: number}>} dataPoints
 * @returns {{slope: number, intercept: number, r2: number, predict: function}}
 */
function linearRegression(dataPoints) {
  const n = dataPoints.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };
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
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const meanY = sumY / n;
  let ssTot = 0; // Total sum of squares
  let ssRes = 0; // Residual sum of squares

  dataPoints.forEach(({ x, y }) => {
    const predicted = slope * x + intercept;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - predicted) ** 2;
  });

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return {
    slope,
    intercept,
    r2,
    predict: (x) => slope * x + intercept,
  };
}

/**
 * Perform polynomial regression (degree 2)
 * @param {Array<{x: number, y: number}>} dataPoints
 * @returns {{coefficients: number[], r2: number, predict: function}}
 */
function polynomialRegression(dataPoints, degree = 2) {
  const n = dataPoints.length;
  if (n === 0) {
    return { coefficients: [], r2: 0, predict: () => 0 };
  }

  // Build matrix for polynomial regression
  const X = dataPoints.map(({ x }) => {
    const row = [];
    for (let d = 0; d <= degree; d++) {
      row.push(Math.pow(x, d));
    }
    return row;
  });

  const y = dataPoints.map(({ y }) => y);

  // Solve using normal equations: (X^T * X)^-1 * X^T * y
  const XT = transpose(X);
  const XTX = matrixMultiply(XT, X);
  const XTy = matrixVectorMultiply(XT, y);
  const coefficients = solveLinearSystem(XTX, XTy);

  // Calculate R²
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let ssTot = 0;
  let ssRes = 0;

  dataPoints.forEach(({ x, y: actualY }, i) => {
    const predictedY = coefficients.reduce(
      (sum, coef, d) => sum + coef * Math.pow(x, d),
      0
    );
    ssTot += Math.pow(actualY - meanY, 2);
    ssRes += Math.pow(actualY - predictedY, 2);
  });

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return {
    coefficients,
    r2,
    predict: (x) =>
      coefficients.reduce((sum, coef, d) => sum + coef * Math.pow(x, d), 0),
  };
}

/**
 * Exponential smoothing for time series
 * @param {Array<number>} values
 * @param {number} alpha - smoothing factor (0-1)
 * @returns {{smoothed: number[], predict: function}}
 */
function exponentialSmoothing(values, alpha = 0.3) {
  if (values.length === 0) {
    return { smoothed: [], predict: () => 0 };
  }

  const smoothed = [values[0]];
  for (let i = 1; i < values.length; i++) {
    smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
  }

  // Calculate trend
  const recentWindow = 5;
  const recent = smoothed.slice(-recentWindow);
  const trend = (recent[recent.length - 1] - recent[0]) / (recentWindow - 1);

  return {
    smoothed,
    predict: (stepsAhead) => smoothed[smoothed.length - 1] + trend * stepsAhead,
  };
}

/**
 * Moving average with trend
 * @param {Array<number>} values
 * @param {number} window
 * @returns {{predict: function}}
 */
function movingAverageTrend(values, window = 10) {
  if (values.length < window) {
    return { predict: () => values[values.length - 1] || 0 };
  }

  const recent = values.slice(-window);
  const avg = recent.reduce((a, b) => a + b, 0) / window;

  // Calculate trend using linear regression on recent window
  const trendPoints = recent.map((y, i) => ({ x: i, y }));
  const { slope } = linearRegression(trendPoints);

  return {
    predict: (stepsAhead) => avg + slope * (window / 2 + stepsAhead),
  };
}

// Matrix operations helpers
function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function matrixMultiply(a, b) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function matrixVectorMultiply(matrix, vector) {
  return matrix.map((row) =>
    row.reduce((sum, val, i) => sum + val * vector[i], 0)
  );
}

function solveLinearSystem(A, b) {
  // Gaussian elimination with partial pivoting
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

/**
 * Calculate year-over-year growth rates
 * @param {Array<{year: number, emissions: number}>} trend
 * @returns {Array<number>} growth rates
 */
function calculateGrowthRates(trend) {
  const rates = [];
  for (let i = 1; i < trend.length; i++) {
    const prev = trend[i - 1].emissions;
    const curr = trend[i].emissions;
    if (prev > 0) {
      rates.push((curr - prev) / prev);
    }
  }
  return rates;
}

/**
 * Calculate Mean Absolute Percentage Error
 * @param {Array<number>} actual
 * @param {Array<number>} predicted
 * @returns {number}
 */
function calculateMAPE(actual, predicted) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? (sum / count) * 100 : 0;
}

/**
 * Ensemble prediction combining multiple models
 * @param {Array<{name: string, weight: number, predict: function}>} models
 * @returns {function}
 */
function ensemblePredict(models) {
  return (x) => {
    const totalWeight = models.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = models.reduce(
      (sum, m) => sum + m.predict(x) * m.weight,
      0
    );
    return weightedSum / totalWeight;
  };
}

/**
 * Build ML model and generate predictions for next 10 years
 * Uses ensemble of Linear, Polynomial, and Exponential Smoothing
 * Predictions start from 2025 (after dataset ends in 2024)
 * @returns {Promise<{
 *   historical: Array<{year: number, emissions: number}>,
 *   predictions: Array<{year: number, emissions: number, confidence: string}>,
 *   models: Object,
 *   metrics: Object,
 *   ensemble: Object
 * }>}
 */
export async function buildCO2PredictionModel() {
  console.log("🤖 Building ensemble ML prediction model...");

  // Fetch global emissions trend
  const trend = await getGlobalEmissionsTrend();
  if (!trend || trend.length === 0) {
    throw new Error("No global emissions data available for modeling");
  }

  // Verify dataset ends in 2024
  const lastYear = trend[trend.length - 1].year;
  console.log(`📅 Dataset ends in: ${lastYear}`);

  if (lastYear !== 2024) {
    console.warn(`⚠️ Expected dataset to end in 2024, but ends in ${lastYear}`);
  }

  // Use last 30 years for training (1995-2024) for robust trend capture
  const trainingYears = 30;
  const trainingData = trend.slice(-trainingYears);

  console.log("📈 Training data:", {
    totalPoints: trend.length,
    trainingPoints: trainingData.length,
    yearRange: `${trainingData[0].year}-${trainingData[trainingData.length - 1].year}`,
  });

  // Prepare data for different models
  const dataPoints = trainingData.map(({ year, emissions }) => ({
    x: year,
    y: emissions,
  }));
  const emissionsValues = trainingData.map((d) => d.emissions);

  // ===== MODEL 1: Linear Regression =====
  console.log("🔵 Training Linear Regression...");
  const linearModel = linearRegression(dataPoints);
  console.log(`  R² = ${linearModel.r2.toFixed(4)}`);

  // ===== MODEL 2: Polynomial Regression (degree 2) =====
  console.log("🟣 Training Polynomial Regression (degree 2)...");
  const polyModel = polynomialRegression(dataPoints, 2);
  console.log(`  R² = ${polyModel.r2.toFixed(4)}`);

  // ===== MODEL 3: Exponential Smoothing =====
  console.log("🟢 Training Exponential Smoothing...");
  const expModel = exponentialSmoothing(emissionsValues, 0.3);

  // ===== MODEL 4: Moving Average with Trend =====
  console.log("🟡 Training Moving Average Trend...");
  const maModel = movingAverageTrend(emissionsValues, 10);

  // ===== Validate models on training data =====
  const linearPreds = dataPoints.map((p) => linearModel.predict(p.x));
  const polyPreds = dataPoints.map((p) => polyModel.predict(p.x));

  const linearMAPE = calculateMAPE(emissionsValues, linearPreds);
  const polyMAPE = calculateMAPE(emissionsValues, polyPreds);

  console.log("📊 Model Performance (MAPE):");
  console.log(`  Linear: ${linearMAPE.toFixed(2)}%`);
  console.log(`  Polynomial: ${polyMAPE.toFixed(2)}%`);

  // ===== Determine optimal weights based on R² and MAPE =====
  // Higher R² and lower MAPE = higher weight
  const linearScore = linearModel.r2 * (1 / (1 + linearMAPE / 100));
  const polyScore = polyModel.r2 * (1 / (1 + polyMAPE / 100));

  // Normalize weights
  const totalScore = linearScore + polyScore + 0.8 + 0.7; // +0.8 for exp, +0.7 for MA
  const weights = {
    linear: linearScore / totalScore,
    poly: polyScore / totalScore,
    exp: 0.8 / totalScore,
    ma: 0.7 / totalScore,
  };

  console.log("⚖️ Ensemble Weights:", {
    linear: (weights.linear * 100).toFixed(1) + "%",
    poly: (weights.poly * 100).toFixed(1) + "%",
    exp: (weights.exp * 100).toFixed(1) + "%",
    ma: (weights.ma * 100).toFixed(1) + "%",
  });

  // ===== Create ensemble model =====
  const ensembleModels = [
    { name: "Linear", weight: weights.linear, predict: linearModel.predict },
    { name: "Polynomial", weight: weights.poly, predict: polyModel.predict },
    {
      name: "Exp Smoothing",
      weight: weights.exp,
      predict: (year) => {
        const stepsAhead = year - lastYear;
        return expModel.predict(stepsAhead);
      },
    },
    {
      name: "Moving Avg",
      weight: weights.ma,
      predict: (year) => {
        const stepsAhead = year - lastYear;
        return maModel.predict(stepsAhead);
      },
    },
  ];

  const ensemblePredictor = ensemblePredict(ensembleModels);

  // ===== Calculate growth metrics =====
  const growthRates = calculateGrowthRates(trainingData);
  const avgGrowthRate =
    growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
  const recentGrowthRates = growthRates.slice(-5);
  const recentAvgGrowth =
    recentGrowthRates.reduce((a, b) => a + b, 0) / recentGrowthRates.length;

  let recentTrend;
  if (recentAvgGrowth > 0.01) {
    recentTrend = "accelerating";
  } else if (recentAvgGrowth > 0) {
    recentTrend = "increasing";
  } else if (recentAvgGrowth > -0.01) {
    recentTrend = "stabilizing";
  } else {
    recentTrend = "decreasing";
  }

  console.log("📊 Growth metrics:", {
    avgGrowthRate: (avgGrowthRate * 100).toFixed(2) + "%",
    recentAvgGrowth: (recentAvgGrowth * 100).toFixed(2) + "%",
    recentTrend,
  });

  // ===== Generate predictions from 2025 to 2034 (10 years) =====
  const predictions = [];
  const predictionStartYear = lastYear + 1; // Start from 2025

  for (let i = 0; i < 10; i++) {
    const year = predictionStartYear + i;

    // Ensemble prediction
    const ensembleEmissions = ensemblePredictor(year);

    // Individual model predictions for comparison
    const linearPred = linearModel.predict(year);
    const polyPred = polyModel.predict(year);
    const expPred = expModel.predict(i + 1);
    const maPred = maModel.predict(i + 1);

    // Confidence based on model agreement and time distance
    const predVariance =
      Math.abs(linearPred - ensembleEmissions) +
      Math.abs(polyPred - ensembleEmissions) +
      Math.abs(expPred - ensembleEmissions) +
      Math.abs(maPred - ensembleEmissions);

    const normalizedVariance = predVariance / (4 * ensembleEmissions);

    let confidence;
    if (i < 3 && normalizedVariance < 0.05) {
      confidence = "high";
    } else if (i < 7 && normalizedVariance < 0.1) {
      confidence = "medium";
    } else {
      confidence = "low";
    }

    predictions.push({
      year,
      emissions: Math.max(0, ensembleEmissions),
      confidence,
      models: {
        linear: linearPred,
        polynomial: polyPred,
        exponential: expPred,
        movingAverage: maPred,
      },
    });
  }

  console.log("✅ Ensemble predictions generated:", {
    years: predictions.length,
    range: `${predictions[0].year}-${predictions[predictions.length - 1].year}`,
    firstPrediction: `${predictions[0].year}: ${(predictions[0].emissions / 1e9).toFixed(2)} Gt`,
    lastPrediction: `${predictions[predictions.length - 1].year}: ${(predictions[predictions.length - 1].emissions / 1e9).toFixed(2)} Gt`,
  });

  // Calculate ensemble R² on training data
  const ensembleTrainingPreds = dataPoints.map((p) => ensemblePredictor(p.x));
  const ensembleMAPE = calculateMAPE(emissionsValues, ensembleTrainingPreds);
  const meanY =
    emissionsValues.reduce((a, b) => a + b, 0) / emissionsValues.length;
  let ssTot = 0,
    ssRes = 0;
  emissionsValues.forEach((actualY, i) => {
    ssTot += Math.pow(actualY - meanY, 2);
    ssRes += Math.pow(actualY - ensembleTrainingPreds[i], 2);
  });
  const ensembleR2 = 1 - ssRes / ssTot;

  return {
    historical: trend,
    predictions,
    models: {
      linear: { r2: linearModel.r2, mape: linearMAPE },
      polynomial: { r2: polyModel.r2, mape: polyMAPE },
      ensemble: { r2: ensembleR2, mape: ensembleMAPE },
    },
    metrics: {
      avgGrowthRate,
      recentTrend,
      trainingYears,
      datasetEndYear: lastYear,
      predictionStartYear,
    },
    ensemble: {
      weights,
      algorithm:
        "Weighted ensemble of Linear, Polynomial (deg 2), Exponential Smoothing, and Moving Average",
    },
  };
}

/**
 * Format emissions in appropriate units (tonnes)
 */
export function formatPredictionValue(value) {
  if (!Number.isFinite(value)) return "—";

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)} Gt`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} Mt`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kt`;
  } else {
    return `${value.toFixed(1)} t`;
  }
}
