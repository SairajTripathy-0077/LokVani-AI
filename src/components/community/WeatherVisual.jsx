import React from 'react';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Cloud, 
  CloudFog, 
  Droplets,
  Wind
} from 'lucide-react';

export const CONDITION_TRANSLATIONS = {
  'Clear Sky': { en: 'Clear Sky', hi: 'साफ़ मौसम' },
  'Partly Cloudy': { en: 'Partly Cloudy', hi: 'आंशिक बादल' },
  'Light Rain & Drizzle': { en: 'Light Rain & Drizzle', hi: 'हल्की बारिश व फुहारें' },
  'Rain Showers': { en: 'Rain Showers', hi: 'बारिश की बौछारें' },
  'Heavy Rain': { en: 'Heavy Rain', hi: 'तेज़ बारिश' },
  'Thunderstorm': { en: 'Thunderstorm', hi: 'गरज के साथ बारिश' },
  'Overcast': { en: 'Overcast', hi: 'घने बादल' },
  'Fog': { en: 'Fog / Mist', hi: 'कोहरा / धुंध' },
};

/**
 * Returns localized condition name
 */
export function getLocalizedCondition(conditionName = 'Clear Sky', lang = 'en') {
  if (!conditionName) return lang === 'hi' ? 'साफ़ मौसम' : 'Clear Sky';
  const match = Object.entries(CONDITION_TRANSLATIONS).find(([key]) => 
    conditionName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(conditionName.toLowerCase())
  );
  if (match) {
    return lang === 'hi' ? match[1].hi : match[1].en;
  }
  return conditionName;
}

/**
 * Returns compact Lucide Icon for forecast chips
 */
export function getWeatherForecastIcon(conditionName = '', size = 18) {
  const c = (conditionName || '').toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) {
    return <CloudLightning size={size} color="var(--accent-gold, #a07a1e)" />;
  }
  if (c.includes('shower') || c.includes('heavy')) {
    return <CloudRain size={size} color="var(--accent-primary, #3d6544)" />;
  }
  if (c.includes('drizzle') || c.includes('light rain') || c.includes('rain')) {
    return <CloudDrizzle size={size} color="var(--accent-primary, #3d6544)" />;
  }
  if (c.includes('partly') || c.includes('sun')) {
    return <CloudSun size={size} color="var(--accent-gold, #a07a1e)" />;
  }
  if (c.includes('clear')) {
    return <Sun size={size} color="var(--accent-gold, #a07a1e)" />;
  }
  if (c.includes('fog') || c.includes('mist')) {
    return <CloudFog size={size} color="var(--text-muted, #52525b)" />;
  }
  return <Cloud size={size} color="var(--text-muted, #52525b)" />;
}

/**
 * Premium SVG Pictorial Illustration tailored to LokVani Sage & Zinc Theme
 */
export default function WeatherPictorialArt({ condition = 'Light Rain & Drizzle', size = 80 }) {
  const c = (condition || '').toLowerCase();

  // 1. LIGHT RAIN & DRIZZLE (As requested by the user)
  if (c.includes('drizzle') || (c.includes('light') && c.includes('rain')) || c.includes('rain & drizzle')) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(235, 245, 233, 0.9) 0%, rgba(244, 248, 242, 0.3) 70%, transparent 100%)',
          borderRadius: '50%',
          padding: '4px'
        }}
        aria-label="Light rain and drizzle weather pictorial representation"
      >
        <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sageCloudGrad" x1="16" y1="12" x2="52" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e4ede2" />
              <stop offset="100%" stopColor="#c7dcbf" />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0" y1="0" x2="0" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#48734f" />
              <stop offset="100%" stopColor="#2d5234" />
            </linearGradient>
          </defs>

          {/* Soft Ground Shadow */}
          <ellipse cx="34" cy="62" rx="18" ry="2.5" fill="rgba(61, 101, 68, 0.12)" />

          {/* Backdrop Soft Cloud */}
          <path
            d="M44 32h-22a10 10 0 0 1-1.6-19.88A14 14 0 0 1 43.6 14.5 9 9 0 0 1 44 32z"
            fill="#dbe8d7"
            opacity="0.75"
            transform="translate(4, -4)"
          />

          {/* Main Forecast Cloud */}
          <path
            d="M48 38H20a11 11 0 0 1-1.8-21.85A15 15 0 0 1 47.4 17.5 10 10 0 0 1 48 38z"
            fill="url(#sageCloudGrad)"
            stroke="#3d6544"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Cloud Highlight Arc */}
          <path
            d="M24 19a11 11 0 0 1 18-2"
            stroke="#ffffff"
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Pictorial Drizzle Droplets with angled rain streaks */}
          <line x1="22" y1="44" x2="19" y2="54" stroke="#3d6544" strokeWidth="2.25" strokeLinecap="round" opacity="0.85" />
          <line x1="31" y1="46" x2="28" y2="58" stroke="#2d5234" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="44" x2="37" y2="54" stroke="#3d6544" strokeWidth="2.25" strokeLinecap="round" opacity="0.85" />
          <line x1="48" y1="46" x2="45" y2="57" stroke="#2d5234" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

          {/* Tiny subtle droplet beads */}
          <circle cx="25" cy="48" r="1.25" fill="#48734f" opacity="0.7" />
          <circle cx="34" cy="50" r="1.25" fill="#48734f" opacity="0.7" />
          <circle cx="43" cy="49" r="1.25" fill="#48734f" opacity="0.7" />
        </svg>
      </div>
    );
  }

  // 2. HEAVY RAIN / RAIN SHOWERS
  if (c.includes('shower') || c.includes('heavy') || c.includes('rain')) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(230, 242, 228, 0.9) 0%, transparent 80%)',
          borderRadius: '50%' 
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heavyCloudGrad" x1="16" y1="12" x2="52" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#dce8d9" />
              <stop offset="100%" stopColor="#b6cfaf" />
            </linearGradient>
          </defs>
          <ellipse cx="34" cy="62" rx="18" ry="2.5" fill="rgba(61, 101, 68, 0.15)" />
          <path
            d="M48 36H20a11 11 0 0 1-1.8-21.85A15 15 0 0 1 47.4 15.5 10 10 0 0 1 48 36z"
            fill="url(#heavyCloudGrad)"
            stroke="#2d5234"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Steady Rain Streaks */}
          <line x1="20" y1="42" x2="16" y2="56" stroke="#2d5234" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="44" x2="24" y2="58" stroke="#3d6544" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="42" x2="32" y2="56" stroke="#2d5234" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="44" y1="44" x2="40" y2="58" stroke="#3d6544" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="51" y1="43" x2="48" y2="55" stroke="#2d5234" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // 3. THUNDERSTORM
  if (c.includes('thunder') || c.includes('storm')) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="34" cy="62" rx="18" ry="2.5" fill="rgba(61, 101, 68, 0.15)" />
          <path
            d="M48 36H20a11 11 0 0 1-1.8-21.85A15 15 0 0 1 47.4 15.5 10 10 0 0 1 48 36z"
            fill="#cad8c8"
            stroke="#27272a"
            strokeWidth="1.75"
          />
          {/* Lightning Bolt in subtle gold */}
          <polygon points="34,36 27,47 33,47 29,58 41,45 35,45" fill="#a07a1e" stroke="#785b1a" strokeWidth="1" />
          <line x1="20" y1="45" x2="17" y2="55" stroke="#3d6544" strokeWidth="2" strokeLinecap="round" />
          <line x1="46" y1="45" x2="43" y2="55" stroke="#3d6544" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. PARTLY CLOUDY
  if (c.includes('partly') || (c.includes('cloud') && c.includes('sun'))) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(254, 249, 235, 0.9) 0%, transparent 75%)',
          borderRadius: '50%'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Warm Sun in background */}
          <circle cx="28" cy="24" r="11" fill="#c49a2a" opacity="0.9" />
          <line x1="28" y1="8" x2="28" y2="12" stroke="#a07a1e" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="16" x2="19" y2="19" stroke="#a07a1e" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="28" x2="16" y2="28" stroke="#a07a1e" strokeWidth="2" strokeLinecap="round" />
          {/* Floating foreground cloud */}
          <path
            d="M50 46H24a10 10 0 0 1-1.6-19.88A14 14 0 0 1 49.6 27.5 9 9 0 0 1 50 46z"
            fill="#e6efe4"
            stroke="#3d6544"
            strokeWidth="1.75"
          />
        </svg>
      </div>
    );
  }

  // 5. CLEAR SKY / SUNNY
  if (c.includes('clear') || c.includes('sun')) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(254, 249, 235, 0.9) 0%, transparent 75%)',
          borderRadius: '50%'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="34" cy="34" r="14" fill="#c49a2a" stroke="#a07a1e" strokeWidth="1.5" />
          {/* Sun Rays */}
          <line x1="34" y1="10" x2="34" y2="16" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="52" x2="34" y2="58" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="34" x2="16" y2="34" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="52" y1="34" x2="58" y2="34" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="17" x2="22" y2="22" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="46" y1="46" x2="51" y2="51" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="51" x2="22" y2="46" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="46" y1="22" x2="51" y2="17" stroke="#a07a1e" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. DEFAULT OVERCAST / CLOUDY
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="34" cy="58" rx="18" ry="2.5" fill="rgba(82, 82, 91, 0.12)" />
        <path
          d="M42 34h-20a9 9 0 0 1-1.5-17.88A13 13 0 0 1 41.6 18.5 8 8 0 0 1 42 34z"
          fill="#dce5db"
          opacity="0.8"
          transform="translate(4, -4)"
        />
        <path
          d="M48 44H20a11 11 0 0 1-1.8-21.85A15 15 0 0 1 47.4 23.5 10 10 0 0 1 48 44z"
          fill="#e2ece0"
          stroke="#52525b"
          strokeWidth="1.75"
        />
      </svg>
    </div>
  );
}
