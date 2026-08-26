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
        daysToLoanDue = 20,
        customRainfallDeviation = null,
        customPriceDrop = null
      } = userOptions;

      // 1. Calculate rainfall deviation from live weather or fallback
      let rainfallDeviationPct = -25; // default moderate deficit for testing
      if (customRainfallDeviation !== null) {
        rainfallDeviationPct = customRainfallDeviation;
      } else if (liveWeather) {
        // If weatherCode is rainy/stormy, less deficit; if clear/heatwave, higher deficit
        if (liveWeather.weatherCode >= 51) {
          rainfallDeviationPct = 10;
        } else if (liveWeather.temperature > 36) {
          rainfallDeviationPct = -35;
        }
      }

      // 2. Calculate Mandi price drop from community intel or fallback
      let priceDropPct = -15; // default moderate drop
      if (customPriceDrop !== null) {
        priceDropPct = customPriceDrop;
      } else if (Array.isArray(communityIntel) && communityIntel.length > 0) {
        const itemRates = communityIntel.filter(i =>
          i.item.toLowerCase().includes(cropType.toLowerCase())
        );
        if (itemRates.length > 0) {
          const latest = itemRates[0];
          if (latest.trend === 'down') priceDropPct = -25;
          else if (latest.trend === 'up') priceDropPct = 5;
          else priceDropPct = 0;
        }
      }

      const inputs = {
        rainfallDeviationPct,
        rainfallTrend: [25, 15, 5],
        priceDropPct,
        priceTrend: [100, 85, 75],
        daysToLoanDue,
        cropStage,
        cropType
      };

      const scoreOutput = calculateDistressScore(inputs);

      return {
        isEnabled: true,
        isAvailable: true,
        inputs,
        ...scoreOutput
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
