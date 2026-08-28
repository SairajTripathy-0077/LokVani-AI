import { describe, it, expect } from 'vitest';
import {
  loadModel,
  getModelMetadata,
  validateInput,
  preprocessInput,
  predict,
  validateOutput,
  getReliability
} from './cropModelService.js';

describe('Crop Model Service — Audit, Validation & Yield Prediction Suite', () => {
  it('1. Loads model configuration and metadata', () => {
    const loaded = loadModel();
    expect(loaded.isLoaded).toBe(true);
    expect(loaded.metadata.modelName).toBe('LokVani-Crop-Yield-V1');

    const meta = getModelMetadata();
    expect(meta.trainingMetrics.r2Score).toBeGreaterThan(0.8);
    expect(meta.inputFields).toContain('soilType');
  });

  it('2. Validates normal agricultural conditions', () => {
    const rawInput = {
      soilType: 'Loamy',
      season: 'Rabi',
      temperature: 20,
      humidity: 60,
      rainfall: 50,
      area: 2.0,
      targetCrop: 'wheat'
    };

    const val = validateInput(rawInput);
    expect(val.isValid).toBe(true);
    expect(val.isOOD).toBe(false);
  });

  it('3. Rejects extreme Out-Of-Distribution inputs (e.g. rainfall = 9999mm)', () => {
    const oodInput = {
      rainfall: 9999 // Extreme OOD rainfall
    };

    const val = validateInput(oodInput);
    expect(val.isValid).toBe(false);
    expect(val.status).toBe('INVALID_OR_OUT_OF_RANGE_INPUT');

    const pred = predict(oodInput);
    expect(pred.status).toBe('INVALID_OR_OUT_OF_RANGE_INPUT');
    expect(pred.reliability).toBe('UNKNOWN');
    expect(pred.prediction).toBeNull();
    expect(pred.source).toBe('CROP_MODEL');
  });

  it('4. Predicts top recommended crops and yield estimates for Rabi loamy soil', () => {
    const rawInput = {
      soilType: 'Loamy',
      season: 'rabi',
      temperature: 18,
      rainfall: 40,
      area: 1.5
    };

    const pred = predict(rawInput);
    expect(pred.status).toBe('SUCCESS');
    expect(pred.source).toBe('CROP_MODEL');
    expect(pred.prediction.primaryCrop).toBe('wheat');
    expect(pred.prediction.topRecommendedCrops.length).toBe(3);
    expect(pred.prediction.estimatedYieldTonsPerHectare).toBeGreaterThan(0);
    expect(validateOutput(pred)).toBe(true);
  });

  it('5. Evaluates reliability levels correctly', () => {
    const highInput = { soilType: 'loamy', temperature: 22, season: 'rabi', nitrogen: 20 };
    const lowInput = { soilType: 'loamy' };

    expect(getReliability(highInput, validateInput(highInput))).toBe('HIGH');
    expect(getReliability(lowInput, validateInput(lowInput))).toBe('LOW');
  });
});
