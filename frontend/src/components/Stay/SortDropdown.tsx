"use client";

import { useState, useRef, useEffect } from "react";

export type SortOption = 
  | 'recommended'
  | 'price_low_high'
  | 'price_high_low'
  | 'star_rating'
  | 'highest_reviewed'
  | 'manasik_score'
  | 'distance_to_haram';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'recommended', label: 'Recommended', icon: 'ri-star-line' },
  { value: 'price_low_high', label: 'Price: Low to High', icon: 'ri-arrow-up-line' },
  { value: 'price_high_low', label: 'Price: High to Low', icon: 'ri-arrow-down-line' },
  { value: 'star_rating', label: 'Star Rating', icon: 'ri-star-fill' },
  { value: 'highest_reviewed', label: 'Highest Reviewed', icon: 'ri-chat-3-line' },
  { value: 'manasik_score', label: 'Manasik Score', icon: 'ri-award-line' },
  { value: 'distance_to_haram', label: 'Distance to Haram', icon: 'ri-map-pin-line' },
];

const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sort-dropdown" ref={dropdownRef}>
      <style jsx>{`
        .sort-dropdown {
          position: relative;
          display: inline-block;
        }

        .sort-trigger {
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
          min-width: 200px;
        }

        .sort-trigger:hover {
          border-color: #ff621f;
          background: #fff9f5;
        }

        .sort-trigger.active {
          border-color: #ff621f;
          box-shadow: 0 0 0 3px rgba(255, 98, 31, 0.1);
        }

        .sort-trigger i {
          font-size: 16px;
          color: #ff621f;
        }

        .sort-trigger .chevron {
          margin-left: auto;
          transition: transform 0.2s ease;
        }

        .sort-trigger.active .chevron {
          transform: rotate(180deg);
        }

        .sort-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          z-index: 100;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sort-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .sort-option:hover {
          background: #f8f9fa;
        }

        .sort-option.selected {
          background: #fff5f0;
          color: #ff621f;
          font-weight: 600;
        }

        .sort-option i {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .sort-option.selected i {
          color: #ff621f;
        }

        .sort-label {
          font-size: 12px;
          color: #666;
          margin-right: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      <button
        className={`sort-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="sort-label">Sort:</span>
        <i className={selectedOption.icon}></i>
        <span>{selectedOption.label}</span>
        <i className="ri-arrow-down-s-line chevron"></i>
      </button>

      {isOpen && (
        <div className="sort-menu">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`sort-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              <i className={option.icon}></i>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
