/**
 * SaleWindowBanner.jsx
 * Shows farmers the best crops to sell right now, based on current prices.
 *
 * UX/UI Refactor Notes (Hackathon PR):
 *   - Banner title changed from "Best Sale Windows" → "Best Time to Sell Right Now"
 *   - "above avg" changed to "above usual price" for clarity
 *
 * Logic:
 *   1. Groups price records by crop name
 *   2. Finds the top 3 highest-priced crops relative to their average
 *   3. Displays a simple advisory strip with which crop to sell and where
 *
 * Props:
 *   @param {Array} intelList — Array of price records from the API
 */

import React, { useMemo } from 'react';
import { TrendingUp, Star } from 'lucide-react';

/**
 * Groups records by item name and computes average price per commodity.
 * Returns the top N entries sorted by "% above average" (best deals first).
 */
function computeSaleWindows(intelList, topN = 3) {
  if (!intelList || intelList.length === 0) return [];

  // Build a map: normalised item name → array of price entries (same unit)
  const groups = {};
  intelList.forEach((rec) => {
    if (!rec.item || rec.price == null) return;
    const key = rec.item.trim().toLowerCase();
    if (!groups[key]) groups[key] = { name: rec.item, prices: [], locations: [] };
    // Normalise everything to "per quintal" for apples-to-apples comparison
    const pricePerQ = rec.unit === 'kg' ? rec.price * 100 : rec.price;
    groups[key].prices.push(pricePerQ);
    if (rec.location && !groups[key].locations.includes(rec.location)) {
      groups[key].locations.push(rec.location);
    }
  });

  // For each commodity: compute max price and deviation from mean
  const windows = Object.values(groups)
    .filter((g) => g.prices.length > 0)
    .map((g) => {
      const maxPrice = Math.max(...g.prices);
      const avgPrice = g.prices.reduce((s, p) => s + p, 0) / g.prices.length;
      const premiumPct = avgPrice > 0 ? ((maxPrice - avgPrice) / avgPrice) * 100 : 0;
      // Find which location has the max price
      const bestRecord = intelList.find(
        (r) =>
          r.item?.trim().toLowerCase() === g.name.trim().toLowerCase() &&
          (r.unit === 'kg' ? r.price * 100 : r.price) === maxPrice
      );
      return {
        name: g.name,
        maxPricePerQ: maxPrice,
        premiumPct,
        bestLocation: bestRecord?.location || g.locations[0] || 'Nearest Mandi',
        unit: bestRecord?.unit || 'quintal',
        displayPrice:
          bestRecord?.unit === 'kg'
            ? `₹${bestRecord.price}/kg`
            : `₹${maxPrice.toLocaleString('en-IN')}/quintal`,
      };
    })
    // Sort by premium percentage descending — highest relative value first
    .sort((a, b) => b.premiumPct - a.premiumPct)
    .slice(0, topN);

  return windows;
}

export default function SaleWindowBanner({ intelList }) {
  const windows = useMemo(() => computeSaleWindows(intelList), [intelList]);

  // Don't render if no data to show
  if (!windows || windows.length === 0) return null;

  return (
    <section aria-labelledby="sale-window-title" className="community-int__banner">
      {/* Icon */}
      <div className="community-int__banner-icon" aria-hidden="true">
        <TrendingUp size={22} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {/* UX Change: "Best Sale Windows Right Now" → "Best Time to Sell Right Now" */}
        <p className="community-int__banner-title" id="sale-window-title">
          <Star size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-gold)' }} aria-hidden="true" />
          Best Time to Sell Right Now
        </p>
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {windows.map((w) => (
            <li key={w.name} className="community-int__banner-body">
              Sell <strong>{w.name}</strong> at{' '}
              <strong>{w.bestLocation}</strong> for{' '}
              <strong>{w.displayPrice}</strong>
              {w.premiumPct > 5 && (
                // UX Change: "above avg" → "above usual price" — clearer for farmers
                <span
                  style={{ marginLeft: '6px', color: 'var(--ci-trend-up)', fontWeight: 700, fontSize: '0.78rem' }}
                  aria-label={`${w.premiumPct.toFixed(0)}% above the usual price`}
                >
                  ↑ {w.premiumPct.toFixed(0)}% above usual
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
