"use client";

import { useState, useEffect } from "react";

export type ViewType = 'kaaba' | 'partial_haram' | 'city' | 'none';

export interface HajjUmrahFilterParams {
  maxWalkingTimeToHaram?: number;
  viewTypes?: ViewType[];
  elderlyFriendly?: boolean;
  familyRooms?: boolean;
  bestForTags?: string[];
  minPrice?: number;
  maxPrice?: number;
}

interface HajjUmrahFiltersProps {
  filters: HajjUmrahFilterParams;
  onFilterChange: (filters: HajjUmrahFilterParams) => void;
  priceRange?: { min: number; max: number };
}

const VIEW_TYPE_OPTIONS: { value: ViewType; label: string; icon: string }[] = [
  { value: 'kaaba', label: 'Kaaba View', icon: '🕋' },
  { value: 'partial_haram', label: 'Partial Haram', icon: '🌙' },
  { value: 'city', label: 'City View', icon: '🏙️' },
];

const BEST_FOR_TAGS: { value: string; label: string; icon: string }[] = [
  { value: 'families', label: 'Families', icon: '👨‍👩‍👧‍👦' },
  { value: 'elderly', label: 'Elderly', icon: '👴' },
  { value: 'first_time_pilgrims', label: 'First Time Pilgrims', icon: '🌟' },
  { value: 'repeat_pilgrims', label: 'Repeat Pilgrims', icon: '🔄' },
  { value: 'couples', label: 'Couples', icon: '💑' },
  { value: 'solo_travelers', label: 'Solo Travelers', icon: '🧳' },
  { value: 'groups', label: 'Groups', icon: '👥' },
  { value: 'wheelchair_users', label: 'Wheelchair Users', icon: '♿' },
  { value: 'budget', label: 'Budget', icon: '💰' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
];

const WALKING_TIME_OPTIONS = [
  { value: 5, label: '5 min or less' },
  { value: 10, label: '10 min or less' },
  { value: 15, label: '15 min or less' },
  { value: 20, label: '20 min or less' },
  { value: 30, label: '30 min or less' },
];

const HajjUmrahFilters = ({ filters, onFilterChange, priceRange }: HajjUmrahFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<HajjUmrahFilterParams>(filters);
  const [expandedSections, setExpandedSections] = useState({
    walkingTime: true,
    viewType: true,
    accessibility: true,
    bestFor: false,
    price: true,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleWalkingTimeChange = (value: number | undefined) => {
    const newFilters = { ...localFilters, maxWalkingTimeToHaram: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleViewTypeToggle = (viewType: ViewType) => {
    const current = localFilters.viewTypes || [];
    const updated = current.includes(viewType)
      ? current.filter(v => v !== viewType)
      : [...current, viewType];
    const newFilters = { ...localFilters, viewTypes: updated.length > 0 ? updated : undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleElderlyFriendlyToggle = () => {
    const newFilters = { ...localFilters, elderlyFriendly: !localFilters.elderlyFriendly || undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFamilyRoomsToggle = () => {
    const newFilters = { ...localFilters, familyRooms: !localFilters.familyRooms || undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBestForToggle = (tag: string) => {
    const current = localFilters.bestForTags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    const newFilters = { ...localFilters, bestForTags: updated.length > 0 ? updated : undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number | undefined) => {
    const newFilters = { 
      ...localFilters, 
      [type === 'min' ? 'minPrice' : 'maxPrice']: value 
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.maxWalkingTimeToHaram) count++;
    if (localFilters.viewTypes?.length) count += localFilters.viewTypes.length;
    if (localFilters.elderlyFriendly) count++;
    if (localFilters.familyRooms) count++;
    if (localFilters.bestForTags?.length) count += localFilters.bestForTags.length;
    if (localFilters.minPrice) count++;
    if (localFilters.maxPrice) count++;
    return count;
  };

  return (
    <div className="hajj-umrah-filters">
      <style jsx>{`
        .hajj-umrah-filters {
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        .filter-section {
          border-bottom: 1px solid #f0f0f0;
        }

        .filter-section:last-child {
          border-bottom: none;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          cursor: pointer;
          user-select: none;
        }

        .filter-header h5 {
          font-size: 14px;
          font-weight: 700;
          color: #111;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-header h5 i {
          color: #ff621f;
        }

        .filter-header .toggle-icon {
          font-size: 18px;
          color: #666;
          transition: transform 0.2s ease;
        }

        .filter-header .toggle-icon.expanded {
          transform: rotate(180deg);
        }

        .filter-content {
          padding-bottom: 16px;
        }

        .walking-time-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .walking-time-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .walking-time-option:hover {
          border-color: #ff621f;
          background: #fff9f5;
        }

        .walking-time-option.selected {
          border-color: #ff621f;
          background: #fff5f0;
        }

        .walking-time-option input {
          accent-color: #ff621f;
        }

        .walking-time-option span {
          font-size: 14px;
          color: #333;
        }

        .view-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .view-type-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          text-align: center;
        }

        .view-type-option:hover {
          border-color: #ff621f;
          background: #fff9f5;
        }

        .view-type-option.selected {
          border-color: #ff621f;
          background: #fff5f0;
        }

        .view-type-option .icon {
          font-size: 24px;
        }

        .view-type-option .label {
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
        }

        .toggle-option .label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #333;
        }

        .toggle-option .label .emoji {
          font-size: 18px;
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 26px;
          background: #e0e0e0;
          border-radius: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .toggle-switch.active {
          background: #ff621f;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.active::after {
          transform: translateX(22px);
        }

        .best-for-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .best-for-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          font-size: 13px;
        }

        .best-for-tag:hover {
          border-color: #ff621f;
          background: #fff9f5;
        }

        .best-for-tag.selected {
          border-color: #ff621f;
          background: #ff621f;
          color: white;
        }

        .best-for-tag .icon {
          font-size: 14px;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .price-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .price-input-group label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .price-input-group input {
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .price-input-group input:focus {
          outline: none;
          border-color: #ff621f;
          box-shadow: 0 0 0 3px rgba(255, 98, 31, 0.1);
        }

        .active-count {
          background: #ff621f;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }
      `}</style>

      {/* Walking Time to Haram */}
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection('walkingTime')}>
          <h5>
            <i className="ri-walk-line"></i>
            Walking Time to Haram
          </h5>
          <i className={`ri-arrow-down-s-line toggle-icon ${expandedSections.walkingTime ? 'expanded' : ''}`}></i>
        </div>
        {expandedSections.walkingTime && (
          <div className="filter-content">
            <div className="walking-time-options">
              {WALKING_TIME_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`walking-time-option ${localFilters.maxWalkingTimeToHaram === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="walkingTime"
                    checked={localFilters.maxWalkingTimeToHaram === option.value}
                    onChange={() => handleWalkingTimeChange(
                      localFilters.maxWalkingTimeToHaram === option.value ? undefined : option.value
                    )}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Type */}
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection('viewType')}>
          <h5>
            <i className="ri-eye-line"></i>
            View Type
            {localFilters.viewTypes?.length ? (
              <span className="active-count">{localFilters.viewTypes.length}</span>
            ) : null}
          </h5>
          <i className={`ri-arrow-down-s-line toggle-icon ${expandedSections.viewType ? 'expanded' : ''}`}></i>
        </div>
        {expandedSections.viewType && (
          <div className="filter-content">
            <div className="view-type-grid">
              {VIEW_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`view-type-option ${localFilters.viewTypes?.includes(option.value) ? 'selected' : ''}`}
                  onClick={() => handleViewTypeToggle(option.value)}
                >
                  <span className="icon">{option.icon}</span>
                  <span className="label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accessibility & Family */}
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection('accessibility')}>
          <h5>
            <i className="ri-accessibility-line"></i>
            Accessibility & Family
          </h5>
          <i className={`ri-arrow-down-s-line toggle-icon ${expandedSections.accessibility ? 'expanded' : ''}`}></i>
        </div>
        {expandedSections.accessibility && (
          <div className="filter-content">
            <div className="toggle-option">
              <div className="label">
                <span className="emoji">♿</span>
                <span>Elderly Friendly</span>
              </div>
              <div
                className={`toggle-switch ${localFilters.elderlyFriendly ? 'active' : ''}`}
                onClick={handleElderlyFriendlyToggle}
              ></div>
            </div>
            <div className="toggle-option">
              <div className="label">
                <span className="emoji">👨‍👩‍👧‍👦</span>
                <span>Family Rooms</span>
              </div>
              <div
                className={`toggle-switch ${localFilters.familyRooms ? 'active' : ''}`}
                onClick={handleFamilyRoomsToggle}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection('price')}>
          <h5>
            <i className="ri-money-dollar-circle-line"></i>
            Price Range
          </h5>
          <i className={`ri-arrow-down-s-line toggle-icon ${expandedSections.price ? 'expanded' : ''}`}></i>
        </div>
        {expandedSections.price && (
          <div className="filter-content">
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Min Price</label>
                <input
                  type="number"
                  placeholder={priceRange ? `$${priceRange.min}` : '$0'}
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="price-input-group">
                <label>Max Price</label>
                <input
                  type="number"
                  placeholder={priceRange ? `$${priceRange.max}` : '$1000'}
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best For Tags */}
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection('bestFor')}>
          <h5>
            <i className="ri-price-tag-3-line"></i>
            Best For
            {localFilters.bestForTags?.length ? (
              <span className="active-count">{localFilters.bestForTags.length}</span>
            ) : null}
          </h5>
          <i className={`ri-arrow-down-s-line toggle-icon ${expandedSections.bestFor ? 'expanded' : ''}`}></i>
        </div>
        {expandedSections.bestFor && (
          <div className="filter-content">
            <div className="best-for-grid">
              {BEST_FOR_TAGS.map((tag) => (
                <div
                  key={tag.value}
                  className={`best-for-tag ${localFilters.bestForTags?.includes(tag.value) ? 'selected' : ''}`}
                  onClick={() => handleBestForToggle(tag.value)}
                >
                  <span className="icon">{tag.icon}</span>
                  <span>{tag.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HajjUmrahFilters;
