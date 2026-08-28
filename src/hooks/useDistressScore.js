import { useMemo } from 'react';
import { calculateDistressScore } from '../engine/distressEngine.js';
import { useApp } from '../context/AppContext';

/**
 * Custom hook to calculate farmer distress risk using existing weather and Mandi data feeds.
 */
export function useDistressScore(userOptions = {}) {
  const { liveWeather, communityIntel } = useApp();

  const isEnabled = import.meta.env.VITE_ENABLE_DISTRESS !== 'false';

  const result = useMemo(() => {
    if (!isEnabled) {
      return { isEnabled: false, isAvailable: false, data: null };
    }

    try {
      const {
        cropType = 'wheat',
        cropStage = 'vegetative',
        daysToLoanDue: initialLoanDays = 20,
        customRainfallDeviation = null,
        customPriceDrop = null,
        conversationMessages = []
      } = userOptions;

      // 1. Parse conversation history for real-time distress signals
      let extractedCrop = cropType;
      let extractedRainfallDeficit = null;
      let extractedPriceDrop = null;
      let extractedLoanDays = initialLoanDays;
      let isDistressMentionedInChat = false;

      if (Array.isArray(conversationMessages) && conversationMessages.length > 0) {
        const fullChatText = conversationMessages.map(m =>
          `${m.transcribedText || ''} ${m.shortAnswerHi || ''} ${m.shortAnswerEn || ''}`
        ).join(' ').toLowerCase();

        // Extract Crop
        if (fullChatText.includes('गेहूं') || fullChatText.includes('wheat')) extractedCrop = 'wheat';
        else if (fullChatText.includes('धान') || fullChatText.includes('चावल') || fullChatText.includes('paddy') || fullChatText.includes('rice')) extractedCrop = 'rice';
        else if (fullChatText.includes('कपास') || fullChatText.includes('cotton')) extractedCrop = 'cotton';
        else if (fullChatText.includes('सरसों') || fullChatText.includes('mustard')) extractedCrop = 'mustard';
        else if (fullChatText.includes('गन्ना') || fullChatText.includes('sugarcane')) extractedCrop = 'sugarcane';

        // Check for negations ("बारिश नहीं रुकी", "भाव नहीं गिरा", "no drop")
        const hasRainNegation = fullChatText.includes('बारिश नहीं रुकी') || fullChatText.includes('बारिश अच्छी') || fullChatText.includes('नुकसान नहीं');
        const hasPriceNegation = fullChatText.includes('भाव नहीं गिरा') || fullChatText.includes('दाम अच्छा') || fullChatText.includes('रेट बढ़िया') || fullChatText.includes('कोई गिरावट नहीं');

        // Extract Rainfall / Drought Signals (respecting negations)
        if (!hasRainNegation && (fullChatText.includes('बारिश नहीं') || fullChatText.includes('सूखा') || fullChatText.includes('drought') || fullChatText.includes('no rain') || fullChatText.includes('कम बारिश') || fullChatText.includes('पानी की कमी'))) {
          extractedRainfallDeficit = -48; // severe rainfall deficit from chat
          isDistressMentionedInChat = true;
        }

        // Extract Mandi Price Drop Signals (respecting negations)
        if (!hasPriceNegation && (fullChatText.includes('भाव गिर') || fullChatText.includes('भाव कम') || fullChatText.includes('price drop') || fullChatText.includes('mandi price crash') || fullChatText.includes('कम दाम') || fullChatText.includes('घाटा'))) {
          extractedPriceDrop = -30; // severe price drop from chat
          isDistressMentionedInChat = true;
        }

        // Extract Loan / KCC Proximity Signals
        if (fullChatText.includes('लोन') || fullChatText.includes('kcc') || fullChatText.includes('loan') || fullChatText.includes('किश्त') || fullChatText.includes('कर्ज') || fullChatText.includes('बैंक')) {
          extractedLoanDays = 7; // loan due urgently
          isDistressMentionedInChat = true;
        }
      }

      // 2. Calculate rainfall deviation from custom option, chat analysis, or live weather
      let rainfallDeviationPct = -25; // default moderate deficit for baseline
      if (customRainfallDeviation !== null) {
        rainfallDeviationPct = customRainfallDeviation;
      } else if (extractedRainfallDeficit !== null) {
        rainfallDeviationPct = extractedRainfallDeficit;
      } else if (liveWeather) {
        if (liveWeather.weatherCode >= 51) {
          rainfallDeviationPct = 10;
        } else if (liveWeather.temperature > 36) {
          rainfallDeviationPct = -35;
        }
      }

      // 3. Calculate Mandi price drop from custom option, chat analysis, or community intel
      let priceDropPct = -15; // default baseline moderate drop
      if (customPriceDrop !== null) {
        priceDropPct = customPriceDrop;
      } else if (extractedPriceDrop !== null) {
        priceDropPct = extractedPriceDrop;
      } else if (Array.isArray(communityIntel) && communityIntel.length > 0) {
        const itemRates = communityIntel.filter(i =>
          i.item.toLowerCase().includes(extractedCrop.toLowerCase())
        );
        if (itemRates.length > 0) {
          const latest = itemRates[0];
          if (latest.trend === 'down') priceDropPct = -25;
          else if (latest.trend === 'up') priceDropPct = 5;
          else priceDropPct = 0;
        }
      }

      const daysToLoanDue = extractedLoanDays;

      const inputs = {
        rainfallDeviationPct,
        rainfallTrend: [25, 15, 5],
        priceDropPct,
        priceTrend: [100, 85, 75],
        daysToLoanDue,
        cropStage,
        cropType: extractedCrop
      };

      const scoreOutput = calculateDistressScore(inputs);

      // Boost or refine spoken reasons based on current conversation context
      const dynamicSpokenReasons = [...(scoreOutput.spokenReasons || [])];
      if (isDistressMentionedInChat && dynamicSpokenReasons.length === 0) {
        dynamicSpokenReasons.push('Aapki haal hi ki baat-chit ke aadhar par khet mein mausam aur arthik jokhmi dekhi gayi hai.');
      }

      return {
        isEnabled: true,
        isAvailable: true,
        inputs,
        ...scoreOutput,
        spokenReasons: dynamicSpokenReasons,
        cropType: extractedCrop
      };
    } catch (err) {
      console.warn('Error in distress prediction engine calculation:', err);
      return {
        isEnabled: true,
        isAvailable: false,
        error: err.message,
        score: 0,
        tier: 'LOW',
        spokenReasons: ['Aapke kshetra ka samanya mausam evam mandi data live hai.'],
        advisory: {
          hi: 'फसल और मौसम की नियमित देखभाल जारी रखें।',
          en: 'Continue regular crop maintenance and weather monitoring.'
        }
      };
    }
  }, [isEnabled, liveWeather, communityIntel, JSON.stringify(userOptions)]);

  return result;
}

export default useDistressScore;
