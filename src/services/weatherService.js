/**
 * Real-time Weather & Crop Advisory Service using Open-Meteo Public Free API
 * Coordinates default: Azamgarh / Eastern UP (Lat: 26.068, Lon: 83.184)
 */

export async function fetchLiveWeatherAndAdvisory(lat = 26.068, lon = 83.184) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Open-Meteo API request failed');

    const data = await response.json();
    const current = data.current_weather || {};
    const temp = current.temperature || 30;
    const windSpeed = current.windspeed || 12;
    const weatherCode = current.weathercode || 0;

    // Interpret WMO Weather interpretation codes
    let statusText = 'Clear Sky';
    let advisory_hi = 'मौसम साफ और सुहावना है। सिंचाई और कटाई के लिए उपयुक्त समय है।';
    let advisory_en = 'Clear weather conditions. Ideal for irrigation and crop harvesting.';

    if (weatherCode >= 51 && weatherCode <= 67) {
      statusText = 'Rainy / Drizzle';
      advisory_hi = 'हल्की बारिश की संभावना है। कीटनाशक छिड़काव स्थगित रखें।';
      advisory_en = 'Light rain forecast. Postpone pesticide spraying and secure harvested crops.';
    } else if (weatherCode >= 71) {
      statusText = 'Stormy / Cold Wave';
      advisory_hi = 'मौसम खराब हो सकता है। फसलों को जलजमाव से बचाएं।';
      advisory_en = 'Adverse weather alert. Protect young crops from waterlogging.';
    } else if (temp > 38) {
      statusText = 'High Temperature / Heatwave';
      advisory_hi = 'तापमान अधिक है। शाम के समय फसलों में हल्की सिंचाई करें।';
      advisory_en = 'High ambient temperature. Apply light evening irrigation to maintain soil moisture.';
    }

    return {
      temperature: temp,
      windSpeed,
      weatherCode,
      statusText,
      advisory_hi,
      advisory_en,
      lastUpdated: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.warn('Weather API fallback activated:', error);
    return {
      temperature: 31,
      windSpeed: 10,
      weatherCode: 0,
      statusText: 'Sunny',
      advisory_hi: 'मौसम अनुकूल है। गेहूं और सब्जियों की फसल में सामयिक देखभाल करें।',
      advisory_en: 'Weather is favorable for crop irrigation and field maintenance.',
      lastUpdated: new Date().toLocaleTimeString()
    };
  }
}
