const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY;

export const DEMO_FEED_ITEMS = [
  {
    id: 'feed_001',
    category: 'PRICE_ALERT',
    headline_hi: 'आज़मगढ़ मंडी में टमाटर के भाव तेज़ी से बढ़े',
    headline_en: 'Tamatar prices surging at local Mandi',
    detail_hi: 'टमाटर का भाव रातों-रात ₹22/kg से ₹38/kg हो गया — MP से आवक कम होने के कारण। 3-4 दिन यही भाव रह सकते हैं।',
    detail_en: 'Tomato rates jumped from ₹22/kg to ₹38/kg overnight due to reduced arrivals. Expected to hold for 3–4 days.',
    reporter_hi: 'रमेश कुमार (किसान)',
    reporter_en: 'Ramesh Kumar (Farmer)',
    location: 'Local Market',
    timestamp: new Date(Date.now() - 12 * 60000),
    confirms: 14,
    flags: 0,
    urgent: true,
  },
  {
    id: 'feed_002',
    category: 'DEMAND_SPIKE',
    headline_hi: 'FreshKart Foods को तुरंत 80 क्विंटल प्याज चाहिए',
    headline_en: 'FreshKart Foods seeking 80 quintal Pyaaz urgently',
    detail_hi: 'FreshKart Foods को शुक्रवार तक ग्रेड A प्याज चाहिए। एकत्रीकरण के लिए किराना नोड ऑपरेटर से संपर्क करें।',
    detail_en: 'Institutional buyer FreshKart Foods requires 80 quintals of Grade A onion by Friday. Contact Kirana Node for aggregation.',
    reporter_hi: 'किराना नोड ऑपरेटर',
    reporter_en: 'Kirana Node Operator',
    location: 'Buyer Hub',
    timestamp: new Date(Date.now() - 35 * 60000),
    confirms: 27,
    flags: 1,
    urgent: true,
  },
  {
    id: 'feed_003',
    category: 'PRICE_DROP',
    headline_hi: 'आलू के भाव गिर रहे हैं — शुक्रवार से पहले बेच दें',
    headline_en: 'Aloo (Potato) rates declining — sell before Friday',
    detail_hi: 'APMC में आलू का भाव इस हफ्ते 18% गिरा — बंपर फसल आने के कारण। बिक्री की खिड़की गुरुवार को बंद हो जाएगी।',
    detail_en: 'Potato prices fell 18% this week at APMC due to bumper harvest arrivals. Sale window closes by Thursday.',
    reporter_hi: 'सुरेश पटेल (व्यापारी)',
    reporter_en: 'Suresh Patel (Vendor)',
    location: 'Regional APMC',
    timestamp: new Date(Date.now() - 2 * 3600000),
    confirms: 9,
    flags: 0,
    urgent: false,
  },
  {
    id: 'feed_004',
    category: 'TRANSPORT',
    headline_hi: 'साझा ट्रक: स्थानीय से शहर, शनिवार सुबह 6 बजे',
    headline_en: 'Shared truck available: Local to City, Sat 6 AM',
    detail_hi: '12 टन क्षमता, 4 टन उपलब्ध। दर: ₹280/क्विंटल। संपर्क: मनोज ट्रांसपोर्ट (किराना नोड के ज़रिए)।',
    detail_en: '12-tonne capacity, 4 tonnes available. Rate: ₹280/quintal. Contact: Manoj Transport (via Kirana Node).',
    reporter_hi: 'मनोज ट्रांसपोर्ट कंपनी',
    reporter_en: 'Manoj Transport Co.',
    location: 'Local → City',
    timestamp: new Date(Date.now() - 4 * 3600000),
    confirms: 6,
    flags: 0,
    urgent: false,
  },
  {
    id: 'feed_005',
    category: 'WARNING',
    headline_hi: 'फर्जी खरीदार अलर्ट — "AgriPremium Traders" असत्यापित',
    headline_en: 'Fake buyer alert — "AgriPremium Traders" unverified',
    detail_hi: 'कई किसानों ने "AgriPremium Traders" द्वारा अग्रिम भुगतान घोटाले की शिकायत की है। पैसे न भेजें। किराना नोड को रिपोर्ट करें।',
    detail_en: 'Multiple farmers report advance payment scam from "AgriPremium Traders". Do not transfer money. Report to Kirana Node.',
    reporter_hi: 'ट्रस्ट नोड मॉडरेटर',
    reporter_en: 'Trust Node Moderator',
    location: 'Regional Alert',
    timestamp: new Date(Date.now() - 6 * 3600000),
    confirms: 43,
    flags: 0,
    urgent: true,
  },
  {
    id: 'feed_006',
    category: 'ANNOUNCEMENT',
    headline_hi: 'PM-KISAN 18वीं किस्त: e-KYC की अंतिम तारीख 15 सितंबर',
    headline_en: 'PM-KISAN 18th installment: e-KYC deadline extended to Sept 15',
    detail_hi: 'सरकार ने PM-KISAN 18वीं किस्त के लिए e-KYC की तारीख बढ़ा दी है। CSC केंद्र या mKisan ऐप पर जाएं।',
    detail_en: 'The government has extended the e-KYC deadline for PM-KISAN 18th installment. Visit CSC center or use mKisan app.',
    reporter_hi: 'सरकारी सलाह (AI-सत्यापित)',
    reporter_en: 'Govt. Advisory (AI-Verified)',
    location: 'All India',
    timestamp: new Date(Date.now() - 12 * 3600000),
    confirms: 89,
    flags: 2,
    urgent: false,
  },
];

export async function fetchLiveNews(state = 'Uttar Pradesh', district = '') {
  if (!GNEWS_KEY) {
    return DEMO_FEED_ITEMS;
  }

  try {
    const query = encodeURIComponent(`"agriculture" OR "farming" OR "crop" OR "mandi" OR "kisan"`);
    // Enforce title matching for stricter relevance
    const res = await fetch(`https://gnews.io/api/v4/search?q=${query}&lang=hi&country=in&max=10&in=title,description&apikey=${GNEWS_KEY}`);
    
    if (!res.ok) {
      throw new Error(`GNews API error: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.articles && data.articles.length > 0) {
      return data.articles.map((article, index) => {
        const isUrgent = article.title.includes('अलर्ट') || article.title.includes('चेतावनी');
        return {
          id: `news_${index}`,
          category: isUrgent ? 'WARNING' : 'ANNOUNCEMENT',
          headline_hi: article.title,
          headline_en: article.title, // GNews lang=hi usually returns Hindi
          detail_hi: article.description,
          detail_en: article.description,
          reporter_hi: article.source.name,
          reporter_en: article.source.name,
          location: `${state}`,
          timestamp: new Date(article.publishedAt),
          confirms: Math.floor(Math.random() * 50) + 5,
          flags: 0,
          urgent: isUrgent,
          url: article.url,
        };
      });
    }
  } catch (err) {
    console.warn('[newsService] Failed to fetch live news:', err.message);
  }

  return DEMO_FEED_ITEMS;
}
