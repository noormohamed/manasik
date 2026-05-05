/**
 * SectionSkeleton Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import SectionSkeleton from '../SectionSkeleton';

describe('SectionSkeleton', () => {
  it('should render with default props (3 KPI cards + chart)', () => {
    const { container } = render(<SectionSkeleton />);

    // Should have animate-pulse for skeleton animation
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Default 3 KPI card skeletons inside the grid
    const grid = container.querySelector('.grid');
    const kpiCards = grid!.querySelectorAll('.bg-white.border');
    expect(kpiCards.length).toBe(3);

    // Chart placeholder should be present
    const chartPlaceholder = container.querySelector('.h-64');
    expect(chartPlaceholder).toBeInTheDocument();
  });

  it('should render custom number of KPI cards', () => {
    const { container } = render(<SectionSkeleton kpiCount={5} />);

    const grid = container.querySelector('.grid');
    const kpiCards = grid!.querySelectorAll('.bg-white.border');
    expect(kpiCards.length).toBe(5);
  });

  it('should hide chart placeholder when showChart is false', () => {
    const { container } = render(<SectionSkeleton showChart={false} />);

    const chartPlaceholder = container.querySelector('.h-64');
    expect(chartPlaceholder).not.toBeInTheDocument();
  });

  it('should render zero KPI cards when kpiCount is 0', () => {
    const { container } = render(<SectionSkeleton kpiCount={0} showChart={false} />);

    const kpiCards = container.querySelectorAll('.bg-white.border');
    expect(kpiCards.length).toBe(0);
  });
});
