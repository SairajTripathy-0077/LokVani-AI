import { describe, it, expect } from 'vitest';
import {
  loadModel,
  getModelMetadata,
  validateInput,
  normalizeInput,
  preprocessInput,
  predict,
  validateOutput,
  getReliability
} from './soilModelService.js';

describe('Soil Model Service — Audit, Validation & Inference Suite', () => {
  it('1. Loads model configuration and metadata cleanly', () => {
    const loaded = loadModel();
    expect(loaded.isLoaded).toBe(true);
    expect(loaded.metadata.modelName).toBe('LokVani-Soil-Fertility-V1');

    const meta = getModelMetadata();
    expect(meta.trainingMetrics.accuracy).toBeGreaterThan(0.9);
    expect(meta.inputFields).toContain('nitrogen');
  });

  it('2. Validates normal soil inputs and passes validation', () => {
    const validRaw = {
      temperature: 28,
      humidity: 55,
      moisture: 40,
      soilType: 'Loamy',
      nitrogen: 20,
      phosphorous: 30,
      potassium: 15,
      pH: 6.8
    };

    const val = validateInput(validRaw);
    expect(val.isValid).toBe(true);
    expect(val.isOOD).toBe(false);
    expect(val.status).toBe('VALID');
  });

  it('3. Rejects Out-Of-Distribution (OOD) invalid inputs (e.g. pH = 15)', () => {
    const oodRaw = {
      temperature: 28,
      nitrogen: 20,
      pH: 15.0 // Invalid pH > 10.5
    };

    const val = validateInput(oodRaw);
    expect(val.isValid).toBe(false);
    expect(val.isOOD).toBe(true);
    expect(val.status).toBe('INVALID_OR_OUT_OF_RANGE_INPUT');
    expect(val.errors.length).toBeGreaterThan(0);

    const pred = predict(oodRaw);
    expect(pred.status).toBe('INVALID_OR_OUT_OF_RANGE_INPUT');
    expect(pred.reliability).toBe('UNKNOWN');
    expect(pred.prediction).toBeNull();
    expect(pred.source).toBe('SOIL_MODEL');
  });

  it('4. Calculates fertilizer & suitability score for nitrogen-deficient soil', () => {
    const rawInput = {
      soilType: 'Loamy',
      nitrogen: 10,
      phosphorous: 35,
      potassium: 15,
      moisture: 40,
      pH: 6.5
    };

    const pred = predict(rawInput);
    expect(pred.status).toBe('SUCCESS');
    expect(pred.source).toBe('SOIL_MODEL');
    expect(pred.inputValidated).toBe(true);
    expect(pred.prediction.recommendedFertilizer).toBe('DAP');
    expect(pred.prediction.suitabilityScore).toBeGreaterThanOrEqual(50);
    expect(validateOutput(pred)).toBe(true);
  });

  it('5. Evaluates reliability levels correctly (HIGH, MEDIUM, LOW, UNKNOWN)', () => {
    const fullInput = { temperature: 28, humidity: 55, moisture: 40, nitrogen: 20, phosphorous: 30, potassium: 15 };
    const partialInput = { nitrogen: 20, phosphorous: 30 };
    const invalidInput = { pH: 99 };

    expect(getReliability(fullInput, validateInput(fullInput))).toBe('HIGH');
    expect(getReliability(partialInput, validateInput(partialInput))).toBe('LOW');
    expect(getReliability(invalidInput, validateInput(invalidInput))).toBe('UNKNOWN');
  });
});
