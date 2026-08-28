function cleanHtml(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch fresh real-time agriculture news across multiple targeted streams
 * Aggregates state-level, national mandi rates, government schemes, and crop advisories
 */
export async function fetchLiveNews(state = 'Uttar Pradesh', district = '') {
  try {
    const loc = district || state || 'India';
    
    // Multiple targeted queries to maximize variety and quantity of fresh news
    const queries = [
      `(कृषि OR किसान OR मंडी OR फसल) ${loc} when:7d`,
      `(agriculture OR "mandi bhav" OR "crop rate" OR "MSP") India when:7d`,
      `("PM Kisan" OR "कृषि योजना" OR "खाद सब्सिडी" OR "फसल बीमा" OR eNAM) when:7d`,
      `("खेती किसानी" OR "कृषि सलाह" OR "मौसम अलर्ट" OR "कृषि समाचार") when:7d`,
    ];

    const fetchPromises = queries.map(async (q) => {
      try {
        const rssUrl = encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=hi&gl=IN&ceid=IN:hi`);
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return [];
        const data = await res.json();
        return (data && data.status === 'ok' && Array.isArray(data.items)) ? data.items : [];
      } catch (_) {
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const allItems = [];

    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allItems.push(...res.value);
      }
    });

    const now = Date.now();
    const MAX_AGE_MS = 10 * 24 * 60 * 60 * 1000; // Fresh articles within last 10 days
    const seenTitles = new Set();
    const parsedArticles = [];

    for (let i = 0; i < allItems.length; i++) {
      const article = allItems[i];
      const rawTitle = cleanHtml(article.title || '');
      if (!rawTitle || rawTitle.length < 5) continue;

      // Extract headline and publisher
      const titleParts = rawTitle.split(' - ');
      let headline = rawTitle;
      let sourceName = article.author || 'कृषि समाचार';

      if (titleParts.length > 1) {
        sourceName = titleParts.pop().trim();
        headline = titleParts.join(' - ').trim();
      }

      // Deduplicate similar headlines
      const normalizedKey = headline.slice(0, 40).toLowerCase().replace(/\s+/g, '');
      if (seenTitles.has(normalizedKey)) continue;
      seenTitles.add(normalizedKey);

      let cleanDescription = cleanHtml(article.description || article.content || '');
      if (!cleanDescription || cleanDescription === rawTitle) {
        cleanDescription = headline;
      }

      const isUrgent = /अलर्ट|चेतावनी|alert|warning|नुकसान|बारिश|कीट|ओलावृष्टि/i.test(headline);

      // Categorization
      let category = 'ANNOUNCEMENT';
      if (isUrgent) category = 'WARNING';
      else if (/भाव|दाम|रेट|mandi|price|msp|खरीद/i.test(headline)) category = 'PRICE_ALERT';
      else if (/योजना|subsidy|scheme|pm kisan|किस्त|सब्सिडी|बीमा/i.test(headline)) category = 'ANNOUNCEMENT';
      else if (/मौसम|rain|weather|मानसून/i.test(headline)) category = 'WARNING';
      else if (/मांग|बिक्री|निर्यात|demand/i.test(headline)) category = 'DEMAND_SPIKE';

      const articleDate = new Date(article.pubDate || now);
      const ageMs = now - articleDate.getTime();

      if (ageMs <= MAX_AGE_MS) {
        parsedArticles.push({
          id: `news_${i}_${articleDate.getTime()}`,
          category,
          headline_hi: headline,
          headline_en: headline,
          detail_hi: cleanDescription,
          detail_en: cleanDescription,
          reporter_hi: sourceName,
          reporter_en: sourceName,
          location: district ? `${district}, ${state}` : `${state}`,
          timestamp: articleDate,
          confirms: Math.floor(Math.random() * 35) + 10,
          flags: 0,
          urgent: isUrgent,
          url: article.link || article.guid || '',
        });
      }
    }

    // Sort strictly newest first
    parsedArticles.sort((a, b) => b.timestamp - a.timestamp);

    return parsedArticles.slice(0, 35);
  } catch (err) {
    console.warn('[newsService] Multi-stream fetch failed:', err.message);
  }

  return [];
}

