"use client";

import SortDropdown, { SortOption } from "./SortDropdown";

interface ResultsHeaderProps {
  totalResults: number;
  location?: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

const ResultsHeader = ({
  totalResults,
  location,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onToggleFilters,
  activeFilterCount,
}: ResultsHeaderProps) => {
  return (
    <div className="results-header">
      <style jsx>{`
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
          gap: 16px;
        }

        .results-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .results-info h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111;
          margin: 0;
        }

        .results-info p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .results-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          transition: all 0.2s ease;
        }

        .filter-toggle-btn:hover {
          border-color: #ff621f;
          background: #fff9f5;
        }

        .filter-toggle-btn i {
          font-size: 16px;
        }

        .filter-badge {
          background: #ff621f;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 40px;
          background: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-toggle-btn:first-child {
          border-right: 1px solid #e0e0e0;
        }

        .view-toggle-btn:hover {
          background: #f8f9fa;
        }

        .view-toggle-btn.active {
          background: #ff621f;
          color: white;
        }

        .view-toggle-btn i {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .results-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .results-info h2 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="results-info">
        <h2>Stays {location ? `in ${location}` : 'Near You'}</h2>
        <p>{totalResults} {totalResults === 1 ? 'property' : 'properties'} found</p>
      </div>

      <div className="results-actions">
        <button className="filter-toggle-btn" onClick={onToggleFilters} type="button">
          <i className="ri-filter-3-line"></i>
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>

        <SortDropdown value={sortBy} onChange={onSortChange} />

        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            type="button"
            title="List View"
          >
            <i className="ri-list-unordered"></i>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => onViewModeChange('map')}
            type="button"
            title="Map View"
          >
            <i className="ri-map-2-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
