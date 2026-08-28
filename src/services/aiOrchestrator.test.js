import { describe, it, expect } from 'vitest';
import { processOrchestratedQuery } from './aiOrchestrator.js';
import { classifyIntent, INTENTS } from './intentRouter.js';

describe('Central AI Orchestrator & Intent Routing Suite', () => {
  it('1. Classifies user query intents accurately', () => {
    expect(classifyIntent('Will it rain tomorrow in Azamgarh?').intent).toBe(INTENTS.WEATHER);
    expect(classifyIntent('Aaj tamatar ka Mandi bhav kya hai?').intent).toBe(INTENTS.MANDI_PRICE);
    expect(classifyIntent('Mitti me kitna urea daalein?').intent).toBe(INTENTS.SOIL_ADVISORY);
    expect(classifyIntent('Mere soil ke hisaab se kaunsi fasal lagani chahiye?').intent).toBe(INTENTS.CROP_PREDICTION);
    expect(classifyIntent('PM Kisan yojana ki kisht kab aayegi?').intent).toBe(INTENTS.SCHEME_QUERY);
    expect(classifyIntent('Sukha pad gaya hai, fasal kharab ho rahi hai').intent).toBe(INTENTS.DISTRESS_CHECK);
  });

  it('2. Orchestrates WEATHER query using live verified weather service', async () => {
    const res = await processOrchestratedQuery({
      queryText: 'Mausam kaisa rahega Azamgarh me?',
      userLocation: 'Azamgarh, UP'
    });

    expect(res.intent).toBe(INTENTS.WEATHER);
    expect(res.sources).toContain('WEATHER_API');
    expect(res.weatherData).not.toBeNull();
    expect(res.weatherData.temperature).toBeDefined();
    expect(typeof res.answer).toBe('string');
  });

  it('3. Orchestrates MANDI_PRICE query using verified Mandi price service', async () => {
    const res = await processOrchestratedQuery({
      queryText: 'Aaj tamatar ka rate kya hai?',
      userLocation: 'Azamgarh, UP'
    });

    expect(res.intent).toBe(INTENTS.MANDI_PRICE);
    expect(res.sources).toContain('MANDI_API');
    expect(res.mandiData).not.toBeNull();
    expect(res.mandiData.pricePerQuintal).toBeGreaterThan(0);
  });

  it('4. Orchestrates CROP_PREDICTION using Soil Model + Crop Model integration pipeline', async () => {
    const res = await processOrchestratedQuery({
      queryText: 'Mere loamy soil ke hisaab se kaunsi fasal lagani chahiye?',
      userLocation: 'Azamgarh, UP',
      userParams: { soilType: 'loamy', season: 'rabi' }
    });

    expect(res.intent).toBe(INTENTS.CROP_PREDICTION);
    expect(res.sources).toContain('SOIL_MODEL');
    expect(res.sources).toContain('CROP_MODEL');
    expect(res.modelResults.soil).toBeDefined();
    expect(res.modelResults.crop).toBeDefined();
    expect(res.modelResults.crop.prediction.primaryCrop).toBeDefined();
  });

  it('5. Routes high-stakes fertilizer query to Kirana Trust Review queue', async () => {
    const res = await processOrchestratedQuery({
      queryText: 'Mitti me kitna khad aur urea daalein?',
      userLocation: 'Azamgarh, UP'
    });

    expect(res.intent).toBe(INTENTS.SOIL_ADVISORY);
    expect(res.requiresTrustReview).toBe(true);
    expect(res.trustReason).toContain('Kirana operator');
  });

  it('6. Handles Out-Of-Distribution (OOD) invalid inputs safely', async () => {
    const res = await processOrchestratedQuery({
      queryText: 'Mitti ka pH 15.0 hai, kitna urea daalein?',
      userParams: { pH: 15.0 }
    });

    expect(res.requiresTrustReview).toBe(true);
    expect(res.trustReason).toContain('Out-of-range');
  });
});
