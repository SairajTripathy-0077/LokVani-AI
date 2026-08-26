import { describe, it, expect } from 'vitest';
import { calculateDistressScore, containsJargon, JARGON_BLOCKLIST } from './distressEngine.js';

describe('Distress Prediction Engine — Self-Check Test Suite', () => {

  it('1. Monotonicity: increasing distress signals never lowers finalScore', () => {
    const baseInput = {
      rainfallDeviationPct: -10,
      priceDropPct: -10,
      cropStage: 'vegetative',
      cropType: 'wheat',
      daysToLoanDue: 60
    };

    const baseResult = calculateDistressScore(baseInput);

    // Increase rainfall deficit
    const worseRainResult = calculateDistressScore({
      ...baseInput,
      rainfallDeviationPct: -35
    });

    // Increase price drop
    const worsePriceResult = calculateDistressScore({
      ...baseInput,
      priceDropPct: -30
    });

    // Worsen loan due proximity
    const worseLoanResult = calculateDistressScore({
      ...baseInput,
      daysToLoanDue: 5
    });

    expect(worseRainResult.score).toBeGreaterThanOrEqual(baseResult.score);
    expect(worsePriceResult.score).toBeGreaterThanOrEqual(baseResult.score);
    expect(worseLoanResult.score).toBeGreaterThanOrEqual(baseResult.score);
  });

  it('2. Boundary Cases: all-good vs all-catastrophic vs single signal', () => {
    const allGood = calculateDistressScore({
      rainfallDeviationPct: 5,
      rainfallTrend: [20, 25, 30],
      priceDropPct: 5,
      priceTrend: [100, 105, 110],
      daysToLoanDue: null,
      cropStage: 'harvest',
      cropType: 'wheat'
    });

    expect(allGood.score).toBeLessThan(35);
    expect(allGood.tier).toBe('LOW');

    const allCatastrophic = calculateDistressScore({
      rainfallDeviationPct: -50,
      rainfallTrend: [50, 25, 5],
      priceDropPct: -40,
      priceTrend: [100, 70, 40],
      daysToLoanDue: 3,
      cropStage: 'flowering',
      cropType: 'tomato'
    });

    expect(allCatastrophic.score).toBeGreaterThanOrEqual(65);
    expect(allCatastrophic.tier).toBe('URGENT');

    const singleSignalRain = calculateDistressScore({
      rainfallDeviationPct: -25,
      priceDropPct: 0,
      daysToLoanDue: null,
      cropStage: 'maturity',
      cropType: 'wheat'
    });

    expect(singleSignalRain.score).toBeLessThan(65); // Moderate, below URGENT
  });

  it('3. Backtest Replay: engine correctly separates high distress from normal periods', () => {
    const highDistressSet = [
      { rainfallDeviationPct: -40, priceDropPct: -30, cropStage: 'flowering', cropType: 'wheat', daysToLoanDue: 10 },
      { rainfallDeviationPct: -45, priceDropPct: -25, cropStage: 'vegetative', cropType: 'rice', daysToLoanDue: 7 }
    ];

    const normalSet = [
      { rainfallDeviationPct: 0, priceDropPct: 0, cropStage: 'harvest', cropType: 'wheat', daysToLoanDue: null },
      { rainfallDeviationPct: 10, priceDropPct: 5, cropStage: 'maturity', cropType: 'rice', daysToLoanDue: 90 }
    ];

    const avgHigh = highDistressSet.reduce((s, c) => s + calculateDistressScore(c).score, 0) / highDistressSet.length;
    const avgNormal = normalSet.reduce((s, c) => s + calculateDistressScore(c).score, 0) / normalSet.length;

    expect(avgHigh).toBeGreaterThan(avgNormal + 25);
  });

  it('4. Reason Integrity: reasons are accurate and non-contradictory', () => {
    const res = calculateDistressScore({
      rainfallDeviationPct: -35,
      priceDropPct: 0, // Favorable price
      daysToLoanDue: null,
      cropStage: 'vegetative',
      cropType: 'wheat'
    });

    expect(res.reasons.length).toBeGreaterThan(0);
    expect(res.reasons.some(r => r.includes('Rainfall'))).toBe(true);
    expect(res.reasons.some(r => r.includes('Mandi price'))).toBe(false); // Does not flag price if favorable
  });

  it('5. Jargon Blocklist Enforcement: spokenReasons must contain no technical terms', () => {
    const testCases = [
      { rainfallDeviationPct: -40, priceDropPct: -30, daysToLoanDue: 10, cropStage: 'flowering', cropType: 'wheat' },
      { rainfallDeviationPct: -20, priceDropPct: -15, daysToLoanDue: 20, cropStage: 'vegetative', cropType: 'tomato' },
      { rainfallDeviationPct: -50, priceDropPct: -45, daysToLoanDue: 2, cropStage: 'sowing', cropType: 'potato' }
    ];

    testCases.forEach(c => {
      const res = calculateDistressScore(c);
      res.spokenReasons.forEach(reason => {
        const containsForbiddenJargon = containsJargon(reason);
        if (containsForbiddenJargon) {
          console.error(`Jargon violation found in spoken reason: "${reason}"`);
        }
        expect(containsForbiddenJargon).toBe(false);
      });
    });
  });

});
