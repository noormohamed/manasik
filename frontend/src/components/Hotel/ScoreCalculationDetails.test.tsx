import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreCalculationDetails from './ScoreCalculationDetails';

describe('ScoreCalculationDetails', () => {
  const mockMetrics = [
    {
      name: 'Walking Time to Haram',
      score: 3,
      basis: 'Calculated from 450m gate distance at 5 km/h average pace',
      inputData: 'Gate proximity: 450 meters',
      lastUpdated: '2 hours ago',
      dataPoints: 1,
      insufficientData: false,
    },
    {
      name: 'Route Ease',
      score: 2,
      basis: 'Based on 350m distance with stairs',
      inputData: 'Distance: 350m, Terrain: stairs present',
      lastUpdated: '2 hours ago',
      dataPoints: 1,
      insufficientData: false,
    },
    {
      name: 'Experience Friction',
      score: 0,
      basis: 'Insufficient data for calculation',
      inputData: 'Review count: 2 (minimum 5 required)',
      lastUpdated: 'N/A',
      dataPoints: 2,
      insufficientData: true,
    },
  ];

  it('renders the component with title', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(screen.getByText('How This Score Is Calculated')).toBeInTheDocument();
  });

  it('renders all metrics', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(screen.getByText('Walking Time to Haram')).toBeInTheDocument();
    expect(screen.getByText('Route Ease')).toBeInTheDocument();
    expect(screen.getByText('Experience Friction')).toBeInTheDocument();
  });

  it('displays score for metrics with sufficient data', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(screen.getByText('Score: 3/3')).toBeInTheDocument();
    expect(screen.getByText('Score: 2/3')).toBeInTheDocument();
  });

  it('displays insufficient data badge for metrics without enough data', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    const insufficientBadges = screen.getAllByText('Insufficient Data');
    expect(insufficientBadges.length).toBeGreaterThan(0);
  });

  it('displays calculation basis for each metric', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(
      screen.getByText('Calculated from 450m gate distance at 5 km/h average pace')
    ).toBeInTheDocument();
    expect(screen.getByText('Based on 350m distance with stairs')).toBeInTheDocument();
  });

  it('displays input data for each metric', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(screen.getByText('Gate proximity: 450 meters')).toBeInTheDocument();
    expect(screen.getByText('Distance: 350m, Terrain: stairs present')).toBeInTheDocument();
  });

  it('displays data points and last updated information', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(screen.getAllByText('Data Points:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last Updated:').length).toBeGreaterThan(0);
  });

  it('renders with custom title', () => {
    const customTitle = 'Score Calculation Details';
    render(<ScoreCalculationDetails metrics={mockMetrics} title={customTitle} />);
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('renders footer note about automatic calculations', () => {
    render(<ScoreCalculationDetails metrics={mockMetrics} />);
    expect(
      screen.getByText(/All scores are calculated automatically/i)
    ).toBeInTheDocument();
  });

  it('handles empty metrics array', () => {
    render(<ScoreCalculationDetails metrics={[]} />);
    expect(screen.getByText('How This Score Is Calculated')).toBeInTheDocument();
  });
});
