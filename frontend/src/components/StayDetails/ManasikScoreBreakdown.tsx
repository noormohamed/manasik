'use client';

import React from 'react';
import {
  ScoringBreakdown,
  CategoryBreakdown,
  scoreColour,
} from '@/types/scoring';

interface ManasikScoreBreakdownProps {
  breakdown: ScoringBreakdown;
  /** Show the full characteristic-level detail (defaults to false — summary only) */
  detailed?: boolean;
}

interface CategoryRow {
  key: keyof ScoringBreakdown['categories'];
  label: string;
}

const CATEGORY_ROWS: CategoryRow[] = [
  { key: 'location',           label: 'Location'            },
  { key: 'pilgrimSuitability', label: 'Pilgrim Suitability' },
  { key: 'hotelQuality',       label: 'Hotel Quality'       },
  { key: 'experienceFriction', label: 'Experience Friction' },
  { key: 'userReviews',        label: 'User Reviews'        },
];

const ScoreBar: React.FC<{ value: number; colour: string }> = ({ value, colour }) => (
  <div
    style={{
      position: 'relative',
      height: 8,
      background: '#f0f0f0',
      borderRadius: 4,
      overflow: 'hidden',
      flex: 1,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${(value / 10) * 100}%`,
        background: colour,
        borderRadius: 4,
        transition: 'width 0.4s ease',
      }}
    />
  </div>
);

const ManasikScoreBreakdown: React.FC<ManasikScoreBreakdownProps> = ({
  breakdown,
}) => {
  const overall = breakdown.overall;
  const overallColour = scoreColour(overall);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '20px 24px',
        marginTop: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Manasik Rating
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Weighted score across 5 pilgrim-focused categories
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: overallColour,
            color: '#fff',
            borderRadius: 10,
            padding: '8px 16px',
            minWidth: 64,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
            {overall.toFixed(1)}
          </span>
          <span style={{ fontSize: 11, marginTop: 2 }}>out of 10</span>
        </div>
      </div>

      {/* Category bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CATEGORY_ROWS.map(({ key, label }) => {
          const cat: CategoryBreakdown = breakdown.categories[key];
          const colour = scoreColour(cat.score);

          return (
            <div key={key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#374151' }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: colour,
                    minWidth: 32,
                    textAlign: 'right',
                  }}
                >
                  {cat.score.toFixed(1)}
                </span>
              </div>
              <ScoreBar value={cat.score} colour={colour} />
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p
        style={{
          margin: '16px 0 0',
          fontSize: 12,
          color: '#9ca3af',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 12,
        }}
      >
      User Reviews is based on verified guest ratings.
      </p>
    </div>
  );
};

export default ManasikScoreBreakdown;
