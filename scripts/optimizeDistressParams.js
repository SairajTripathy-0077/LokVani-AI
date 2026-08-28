import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateDistressScore } from '../src/engine/distressEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Offline Distress Engine Parameter Optimizer
 * Performs a grid search over parameters to optimize rank separation
 * between historical high-distress (drought/price-crash) scenarios and normal scenarios.
 */
function runOptimization() {
  console.log('🌾 LokVani AI — Distress Engine Parameter Optimizer');
  console.log('====================================================');

  // Synthetic & historical weak-labeled sample test cases
  const highDistressCases = [
    { rainfallDeviationPct: -45, rainfallTrend: [50, 30, 10], priceDropPct: -30, priceTrend: [40, 25, 15], daysToLoanDue: 7, cropStage: 'flowering', cropType: 'wheat' },
    { rainfallDeviationPct: -50, rainfallTrend: [60, 40, 15], priceDropPct: -35, priceTrend: [50, 30, 18], daysToLoanDue: 10, cropStage: 'vegetative', cropType: 'rice' },
    { rainfallDeviationPct: -40, rainfallTrend: [30, 20, 5], priceDropPct: -25, priceTrend: [30, 20, 12], daysToLoanDue: 14, cropStage: 'flowering', cropType: 'tomato' }
  ];

  const normalCases = [
    { rainfallDeviationPct: 5, rainfallTrend: [30, 32, 35], priceDropPct: 2, priceTrend: [20, 21, 22], daysToLoanDue: null, cropStage: 'maturity', cropType: 'wheat' },
    { rainfallDeviationPct: 0, rainfallTrend: [40, 42, 41], priceDropPct: -5, priceTrend: [25, 25, 24], daysToLoanDue: 90, cropStage: 'harvest', cropType: 'rice' },
    { rainfallDeviationPct: 10, rainfallTrend: [20, 22, 25], priceDropPct: 5, priceTrend: [15, 16, 18], daysToLoanDue: null, cropStage: 'sowing', cropType: 'potato' }
  ];

  let bestParams = {
    W_RAIN: 0.45,
    W_PRICE: 0.35,
    K_INTERACT: 0.25,
    PROXIMITY_K: 10,
    V_K: 0.5,
    ADVISORY_THRESHOLD: 35,
    URGENT_THRESHOLD: 65
  };

  let maxMargin = -Infinity;

  // Grid search space
  for (let wRain = 0.35; wRain <= 0.55; wRain += 0.05) {
    for (let wPrice = 0.25; wPrice <= 0.45; wPrice += 0.05) {
      for (let kInteract = 0.15; kInteract <= 0.35; kInteract += 0.05) {
        for (let proximityK = 5; proximityK <= 15; proximityK += 5) {
          const testParams = {
            W_RAIN: Number(wRain.toFixed(2)),
            W_PRICE: Number(wPrice.toFixed(2)),
            K_INTERACT: Number(kInteract.toFixed(2)),
            PROXIMITY_K: proximityK,
            V_K: 0.5,
            ADVISORY_THRESHOLD: 35,
            URGENT_THRESHOLD: 65
          };

          const avgHigh = highDistressCases.reduce((sum, c) => sum + calculateDistressScore(c, testParams).score, 0) / highDistressCases.length;
          const avgNormal = normalCases.reduce((sum, c) => sum + calculateDistressScore(c, testParams).score, 0) / normalCases.length;

          const margin = avgHigh - avgNormal;

          if (margin > maxMargin) {
            maxMargin = margin;
            bestParams = testParams;
          }
        }
      }
    }
  }

  console.log(`Optimization completed. Maximum score separation margin: ${maxMargin.toFixed(2)} points.`);
  console.log('Winning Parameters:', JSON.stringify(bestParams, null, 2));

  const outputPath = path.join(__dirname, '../src/engine/tunedParams.json');
  fs.writeFileSync(outputPath, JSON.stringify(bestParams, null, 2));
  console.log(`Saved tuned parameters to ${outputPath}`);
}

runOptimization();
