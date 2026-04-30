'use client';

import React from 'react';

interface CalculationMetric {
  name: string;
  score: number;
  basis: string;
  inputData: string;
  lastUpdated: string;
  dataPoints?: number;
  insufficientData?: boolean;
}

interface ScoreCalculationDetailsProps {
  metrics: CalculationMetric[];
  title?: string;
}

const ScoreCalculationDetails: React.FC<ScoreCalculationDetailsProps> = ({
  metrics,
  title = 'How This Score Is Calculated',
}) => {
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
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
          {title}
        </h3>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>
          Understand how each metric is calculated and what data is used
        </p>
      </div>

      {/* Metrics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 16,
              backgroundColor: metric.insufficientData ? '#fef3c7' : '#f9fafb',
            }}
          >
            {/* Metric Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>
                {metric.name}
              </h4>
              {metric.insufficientData ? (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#fbbf24',
                    color: '#78350f',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Insufficient Data
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Score: {metric.score}/3
                </span>
              )}
            </div>

            {/* Calculation Basis */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                Calculation Basis:
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
                {metric.basis}
              </p>
            </div>

            {/* Input Data */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                Input Data Used:
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
                {metric.inputData}
              </p>
            </div>

            {/* Data Points and Last Updated */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                paddingTop: 12,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              {metric.dataPoints !== undefined && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  <span style={{ fontWeight: 500 }}>Data Points:</span> {metric.dataPoints}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                <span style={{ fontWeight: 500 }}>Last Updated:</span> {metric.lastUpdated}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p
        style={{
          margin: '16px 0 0',
          fontSize: 12,
          color: '#9ca3af',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 12,
        }}
      >
        All scores are calculated automatically and updated in real-time as new data becomes available.
        No manual overrides are applied to ensure fairness across all hotels.
      </p>
    </div>
  );
};

export default ScoreCalculationDetails;
