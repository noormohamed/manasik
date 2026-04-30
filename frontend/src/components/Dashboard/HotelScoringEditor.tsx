'use client';

import React, { useCallback } from 'react';
import {
  ScoringData,
  ScoringBreakdown,
  CATEGORIES,
  DEFAULT_WEIGHTS,
  computeScoring,
  defaultScoringData,
  scoreColour,
  normalise,
} from '@/types/scoring';

interface HotelScoringEditorProps {
  /** Current scoring data (will be defaulted if null) */
  scoringData: ScoringData | null;
  /** Hotel's current review average (0–5) for the User Reviews category preview */
  averageRating?: number;
  onChange: (data: ScoringData) => void;
  disabled?: boolean;
  /** Location metrics calculation basis (from backend) */
  locationMetricsBasis?: {
    walkingTimeToHaram?: { basis: string; inputData: string; lastUpdated: string };
    gateProximity?: { basis: string; inputData: string; lastUpdated: string };
    routeEase?: { basis: string; inputData: string; lastUpdated: string };
  };
  /** Experience friction calculation basis (from backend) */
  experienceFrictionBasis?: {
    liftDelays?: { basis: string; inputData: string; lastUpdated: string };
    crowdingAtPeakTimes?: { basis: string; inputData: string; lastUpdated: string };
    checkInSmoothness?: { basis: string; inputData: string; lastUpdated: string };
  };
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Average',
  3: 'Good',
};

const CategoryScorePreview: React.FC<{
  label: string;
  score: number;
}> = ({ label, score }) => {
  const colour = scoreColour(score);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        background: '#f9fafb',
        borderRadius: 6,
        border: `1px solid ${colour}30`,
      }}
    >
      <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: colour }}>
        {score.toFixed(1)}/10
      </span>
    </div>
  );
};

const HotelScoringEditor: React.FC<HotelScoringEditorProps> = ({
  scoringData,
  averageRating = 0,
  onChange,
  disabled = false,
  locationMetricsBasis,
  experienceFrictionBasis,
}) => {
  const data: ScoringData = scoringData ?? defaultScoringData();
  const rating = typeof averageRating === 'number' ? averageRating : 0;

  // Live computed breakdown for preview
  const breakdown: ScoringBreakdown = computeScoring(data, DEFAULT_WEIGHTS, rating);

  const handleChange = useCallback(
    (category: keyof ScoringData, characteristic: string, value: number) => {
      // Prevent changes to location metrics and experience friction (they are auto-calculated)
      if (category === 'location' || category === 'experienceFriction') {
        return;
      }
      const updated: ScoringData = {
        ...data,
        [category]: {
          ...(data[category] as any),
          [characteristic]: value,
        },
      };
      onChange(updated);
    },
    [data, onChange],
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <h6 style={{ margin: 0, fontWeight: 700 }}>Manasik Score Inputs</h6>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
            Rate each characteristic 1 (Poor) · 2 (Average) · 3 (Good)
          </p>
        </div>
        {/* Overall preview badge */}
        <div
          style={{
            background: scoreColour(breakdown.overall),
            color: '#fff',
            borderRadius: 8,
            padding: '6px 14px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
            {breakdown.overall.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, marginTop: 1 }}>Preview</div>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.filter((cat) => cat.key !== 'experienceFriction' && cat.key !== 'location').map((cat) => {
        const catScorePreview = breakdown.categories[cat.key as keyof typeof breakdown.categories];
        const isLocationCategory = cat.key === 'location';

        return (
          <div
            key={cat.key}
            style={{
              marginBottom: 20,
              padding: 14,
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              background: '#fafafa',
            }}
          >
            {/* Category header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#9ca3af',
                    background: '#f3f4f6',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  {DEFAULT_WEIGHTS[cat.key]}%
                </span>
              </div>
              <CategoryScorePreview
                label={cat.label}
                score={catScorePreview.score}
              />
            </div>

            {/* Characteristic inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cat.characteristics.map((char) => {
                const currentValue = (data[cat.key] as any)[char.key] ?? 2;

                // Render other categories as editable
                return (
                  <div key={char.key}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        gap: 12,
                      }}
                    >
                      <label
                        style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}
                      >
                        {char.label}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* 1 · 2 · 3 radio buttons inline */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1, 2, 3].map((v) => (
                            <button
                              key={v}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleChange(cat.key, char.key, v)}
                              style={{
                                maxWidth: '40px',
                                padding: '4px 6px',
                                borderRadius: 4,
                                border: currentValue === v
                                  ? `2px solid ${scoreColour(normalise(v))}`
                                  : '1px solid #e5e7eb',
                                background: currentValue === v
                                  ? `${scoreColour(normalise(v))}18`
                                  : '#fff',
                                color: currentValue === v
                                  ? scoreColour(normalise(v))
                                  : '#6b7280',
                                fontWeight: currentValue === v ? 700 : 400,
                                fontSize: 12,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: scoreColour(normalise(currentValue)),
                            fontWeight: 600,
                            minWidth: 100,
                            textAlign: 'right',
                          }}
                        >
                          {currentValue} – {SCORE_LABELS[currentValue]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* User Reviews note */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #bae6fd',
          fontSize: 12,
          color: '#0369a1',
          marginBottom: 12,
        }}
      >
        <strong>📍 Location Metrics (35%)</strong> — Walking Time to Haram, Gate Proximity, and Route Ease are calculated automatically from hotel location data and cannot be adjusted manually. This ensures fairness across all hotels.
      </div>

      {/* Experience Friction note */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #bae6fd',
          fontSize: 12,
          color: '#0369a1',
          marginBottom: 12,
        }}
      >
        <strong>🔄 Experience Friction (10%)</strong> — Lift Delays, Crowding at Peak Times, and Check-in Smoothness are calculated automatically from guest reviews and cannot be adjusted manually. This ensures fairness based on actual guest experiences.
      </div>

      {/* User Reviews note */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #bae6fd',
          fontSize: 12,
          color: '#0369a1',
        }}
      >
        <strong>⭐ User Reviews ({DEFAULT_WEIGHTS.userReviews}%)</strong> — this
        category is derived automatically from verified guest ratings and cannot be
        adjusted manually.
        {rating > 0 && (
          <span style={{ marginLeft: 6 }}>
            Current average: <strong>{Number(rating).toFixed(1)} / 5</strong> →{' '}
            <strong>{breakdown.categories.userReviews.score.toFixed(1)} / 10</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default HotelScoringEditor;
