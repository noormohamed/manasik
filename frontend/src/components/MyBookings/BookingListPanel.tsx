/**
 * BookingListPanel Component
 * Left column: displays filterable, sortable list of bookings with selection state
 */

import React, { useMemo, useState } from 'react';
import { Booking, BookingFilters, BookingListPanelProps } from './types';
import { applyFilters, sortBookingsByCheckIn, getUniqueHotels } from './utils';
import BookingCard from './BookingCard';
import styles from './BookingListPanel.module.css';

const BookingListPanel: React.FC<BookingListPanelProps> = ({
  bookings,
  selectedBookingId,
  onSelectBooking,
  filters,
  onFilterChange,
  loading,
  error,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get unique hotels for filter dropdown
  const hotels = useMemo(() => getUniqueHotels(bookings), [bookings]);

  // Apply filters and sort
  const filteredBookings = useMemo(() => {
    const filtered = applyFilters(bookings, filters);
    return sortBookingsByCheckIn(filtered);
  }, [bookings, filters]);

  const handleClearAllFilters = () => {
    onFilterChange('status', '');
    onFilterChange('hotel', '');
    onFilterChange('date', null);
    onFilterChange('searchGuest', '');
  };

  const hasAdvancedFilters = filters.status || filters.hotel || filters.date;
  const hasActiveFilters = hasAdvancedFilters || filters.searchGuest;

  return (
    <div className={styles.panel}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {/* Search Filter - Always Visible */}
        <div className={styles.searchContainer}>
          <input
            id="search-filter"
            type="text"
            className={styles.searchInput}
            placeholder="Search bookings..."
            value={filters.searchGuest}
            onChange={(e) => onFilterChange('searchGuest', e.target.value)}
          />
        </div>

        {/* Advanced Filters Dropdown */}
        <div className={styles.dropdownContainer}>
          <button
            className={`${styles.filterButton} ${hasAdvancedFilters ? styles.filterButtonActive : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Toggle advanced filters"
          >
            <i className="ri-filter-line"></i>
            <span>Filters</span>
            {hasAdvancedFilters && <span className={styles.filterBadge}>{Object.values(filters).filter(v => v && v !== '').length - (filters.searchGuest ? 1 : 0)}</span>}
            <i className={`ri-arrow-down-s-line ${dropdownOpen ? styles.arrowOpen : ''}`}></i>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              {/* Status Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="status-filter" className={styles.label}>
                  Status
                </label>
                <select
                  id="status-filter"
                  className={styles.select}
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Hotel Filter */}
              {hotels.length > 0 && (
                <div className={styles.filterGroup}>
                  <label htmlFor="hotel-filter" className={styles.label}>
                    Hotel
                  </label>
                  <select
                    id="hotel-filter"
                    className={styles.select}
                    value={filters.hotel}
                    onChange={(e) => onFilterChange('hotel', e.target.value)}
                  >
                    <option value="">All Hotels</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="date-filter" className={styles.label}>
                  Check-in Date
                </label>
                <input
                  id="date-filter"
                  type="date"
                  className={styles.input}
                  value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      onFilterChange('date', new Date(e.target.value));
                    } else {
                      onFilterChange('date', null);
                    }
                  }}
                />
              </div>

              {/* Clear Filters Button */}
              {hasAdvancedFilters && (
                <button
                  className={styles.clearButton}
                  onClick={handleClearAllFilters}
                  aria-label="Clear all filters"
                >
                  <i className="ri-close-line"></i> Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Clear All Filters Button (visible when any filter is active) */}
        {hasActiveFilters && (
          <button
            className={styles.clearAllButton}
            onClick={handleClearAllFilters}
            aria-label="Clear all filters"
          >
            <i className="ri-close-line"></i> Clear All
          </button>
        )}
      </div>

      {/* Booking List */}
      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.spinner}></div>
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <i className="ri-error-warning-line"></i>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="ri-inbox-line"></i>
            <p>
              {bookings.length === 0
                ? 'No bookings yet'
                : 'No bookings match your filters'}
            </p>
            {hasActiveFilters && (
              <button
                className={styles.clearButton}
                onClick={handleClearAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isSelected={selectedBookingId === booking.id}
                onClick={() => onSelectBooking(booking)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className={styles.resultCount}>
          Showing {filteredBookings.length} of {bookings.length} booking
          {bookings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default BookingListPanel;
