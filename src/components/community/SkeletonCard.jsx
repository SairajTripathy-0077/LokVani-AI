/**
 * SkeletonCard.jsx
 * Animated pulse skeleton placeholder displayed while price data is loading.
 * Uses aria-busy on the parent grid container (set in CommunityIntel.jsx).
 *
 * Commit: feat(community): add PriceCard, SkeletonCard sub-components
 */

import React from 'react';

/**
 * A single skeleton card. Render multiple instances (e.g. ×6) for the loading grid.
 */
export default function SkeletonCard() {
  return (
    <div className="community-int__skeleton-card" aria-hidden="true">
      {/* Top row: name + price block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="community-int__skeleton" style={{ height: '16px', width: '60%', borderRadius: '4px' }} />
          <div className="community-int__skeleton" style={{ height: '12px', width: '40%', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          <div className="community-int__skeleton" style={{ height: '22px', width: '64px', borderRadius: '4px' }} />
          <div className="community-int__skeleton" style={{ height: '10px', width: '30px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Tag + trend row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div className="community-int__skeleton" style={{ height: '18px', width: '70px', borderRadius: '20px' }} />
        <div className="community-int__skeleton" style={{ height: '16px', width: '50px', borderRadius: '4px' }} />
      </div>

      {/* Footer row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="community-int__skeleton" style={{ height: '12px', width: '45%', borderRadius: '4px' }} />
        <div className="community-int__skeleton" style={{ height: '12px', width: '25%', borderRadius: '4px' }} />
      </div>
    </div>
  );
}
