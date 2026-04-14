"use client";

import React from 'react';
import { useListing } from '@/context/ListingContext';

// Facility icons mapping
const facilityIcons: Record<string, string> = {
  wifi: 'ri-wifi-line',
  parking: 'ri-parking-line',
  restaurant: 'ri-restaurant-line',
  roomService: 'ri-service-line',
  gym: 'ri-run-line',
  pool: 'ri-water-flash-line',
  spa: 'ri-leaf-line',
  airConditioning: 'ri-temp-cold-line',
  laundry: 'ri-t-shirt-line',
  reception24h: 'ri-time-line',
  elevator: 'ri-arrow-up-down-line',
  wheelchairAccess: 'ri-wheelchair-line',
  prayerRoom: 'ri-home-heart-line',
  shuttleService: 'ri-bus-line',
  concierge: 'ri-user-star-line',
  businessCenter: 'ri-briefcase-line',
  meetingRooms: 'ri-team-line',
  safe: 'ri-safe-line',
  currencyExchange: 'ri-exchange-dollar-line',
  atm: 'ri-bank-card-line',
};

// Facility labels
const facilityLabels: Record<string, string> = {
  wifi: 'Free WiFi',
  parking: 'Parking',
  restaurant: 'Restaurant',
  roomService: 'Room Service',
  gym: 'Gym',
  pool: 'Pool',
  spa: 'Spa',
  airConditioning: 'A/C',
  laundry: 'Laundry',
  reception24h: '24h Reception',
  elevator: 'Elevator',
  wheelchairAccess: 'Accessible',
  prayerRoom: 'Prayer Room',
  shuttleService: 'Shuttle',
  concierge: 'Concierge',
  businessCenter: 'Business Center',
  meetingRooms: 'Meeting Rooms',
  safe: 'Safe',
  currencyExchange: 'Currency Exchange',
  atm: 'ATM',
};

const ListingPreview = () => {
  const { listingData, currentStep } = useListing();

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, string> = {
      wifi: 'ri-wifi-line',
      airConditioning: 'ri-temp-cold-line',
      tv: 'ri-tv-line',
      kitchen: 'ri-restaurant-line',
      parking: 'ri-parking-line',
      pool: 'ri-water-flash-line',
    };
    return icons[amenity] || 'ri-checkbox-circle-line';
  };

  const formatPrice = (price: number) => {
    if (!price) return '$0';
    return `${price.toLocaleString()}`;
  };

  return (
    <div className="listing-preview">
      <style jsx>{`
        .listing-preview {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .preview-header {
          background: #f8f9fa;
          color: #333;
          padding: 16px 20px;
          text-align: center;
          border-bottom: 1px solid #e9ecef;
        }
        .preview-header h5 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .preview-header p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #666;
        }
        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .preview-image {
          width: 100%;
          height: 180px;
          background: #f0f0f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-image-placeholder {
          color: #999;
          font-size: 14px;
          text-align: center;
        }
        .preview-image-placeholder i {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }
        .preview-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .preview-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .preview-location i {
          color: #ff6b35;
        }
        .preview-section {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        .preview-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .preview-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .preview-facilities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .preview-facility {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: #fff3e0;
          border-radius: 16px;
          font-size: 11px;
          color: #e65100;
        }
        .preview-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .preview-amenity {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: #f0f7ff;
          border-radius: 16px;
          font-size: 12px;
          color: #0066cc;
        }
        .preview-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .preview-price-value {
          font-size: 28px;
          font-weight: 700;
          color: #ff6b35;
        }
        .preview-price-period {
          font-size: 14px;
          color: #888;
        }
        .preview-description {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          max-height: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-rules {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .preview-rule {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #555;
        }
        .preview-rule i {
          font-size: 14px;
        }
        .preview-rule i.allowed {
          color: #28a745;
        }
        .preview-rule i.not-allowed {
          color: #dc3545;
        }
        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: #f8f9fa;
        }
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ddd;
        }
        .step-dot.active {
          background: #ff6b35;
        }
        .step-dot.completed {
          background: #28a745;
        }
      `}</style>

      <div className="preview-header">
        <h5>Live Preview</h5>
        <p>See your listing as guests will see it</p>
      </div>

      <div className="step-indicator">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(step => (
          <div 
            key={step} 
            className={`step-dot ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>

      <div className="preview-content">
        {/* Cover Image */}
        <div className="preview-image">
          {listingData.coverImage ? (
            <img src={listingData.coverImage} alt="Cover" />
          ) : (
            <div className="preview-image-placeholder">
              <i className="ri-image-add-line"></i>
              <span>Cover image will appear here</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="preview-title">
          {listingData.placeName || 'Your Property Name'}
        </h3>

        {/* Location */}
        <div className="preview-location">
          <i className="ri-map-pin-line"></i>
          <span>
            {listingData.locationLabel || `${listingData.town || 'City'}, ${listingData.country || 'Country'}`}
          </span>
        </div>

        {/* Property Type Badge */}
        <div className="preview-section">
          <span className="preview-amenity" style={{ background: '#fff3e0', color: '#e65100' }}>
            <i className="ri-building-line"></i>
            {listingData.propertyType.charAt(0).toUpperCase() + listingData.propertyType.slice(1)}
          </span>
        </div>

        {/* Facilities */}
        {listingData.facilities && listingData.facilities.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">Facilities</div>
            <div className="preview-facilities">
              {listingData.facilities.slice(0, 8).map(facility => (
                <span key={facility} className="preview-facility">
                  <i className={facilityIcons[facility] || 'ri-checkbox-circle-line'}></i>
                  {facilityLabels[facility] || facility}
                </span>
              ))}
              {listingData.facilities.length > 8 && (
                <span className="preview-facility" style={{ background: '#eee', color: '#666' }}>
                  +{listingData.facilities.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        {(listingData.basePriceWeekday > 0 || listingData.basePriceWeekend > 0) && (
          <div className="preview-section">
            <div className="preview-section-title">Pricing</div>
            <div className="preview-price">
              <span className="preview-price-value">
                ${formatPrice(listingData.basePriceWeekday || listingData.basePriceWeekend)}
              </span>
              <span className="preview-price-period">/ night</span>
            </div>
            {listingData.basePriceWeekend > 0 && listingData.basePriceWeekend !== listingData.basePriceWeekday && (
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Weekend: ${formatPrice(listingData.basePriceWeekend)} / night
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {listingData.description && (
          <div className="preview-section">
            <div className="preview-section-title">About</div>
            <p className="preview-description">{listingData.description}</p>
          </div>
        )}

        {/* Room Amenities */}
        {listingData.amenities && listingData.amenities.length > 0 && (
          <div className="preview-section">
            <div className="preview-section-title">Room Amenities</div>
            <div className="preview-amenities">
              {listingData.amenities.slice(0, 6).map(amenity => (
                <span key={amenity} className="preview-amenity">
                  <i className={getAmenityIcon(amenity)}></i>
                  {amenity.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
              {listingData.amenities.length > 6 && (
                <span className="preview-amenity" style={{ background: '#eee', color: '#666' }}>
                  +{listingData.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* House Rules - Always show */}
        <div className="preview-section">
          <div className="preview-section-title">House Rules</div>
          <div className="preview-rules">
            <div className="preview-rule">
              <i className={`ri-${listingData.houseRules.smoking === 'notAllow' ? 'close' : 'check'}-circle-line ${listingData.houseRules.smoking === 'notAllow' ? 'not-allowed' : 'allowed'}`}></i>
              {listingData.houseRules.smoking === 'notAllow' ? 'No smoking' : listingData.houseRules.smoking === 'charge' ? 'Smoking (extra charge)' : 'Smoking allowed'}
            </div>
            <div className="preview-rule">
              <i className={`ri-${listingData.houseRules.pets === 'notAllow' ? 'close' : 'check'}-circle-line ${listingData.houseRules.pets === 'notAllow' ? 'not-allowed' : 'allowed'}`}></i>
              {listingData.houseRules.pets === 'notAllow' ? 'No pets' : listingData.houseRules.pets === 'charge' ? 'Pets (extra charge)' : 'Pets allowed'}
            </div>
            <div className="preview-rule">
              <i className={`ri-${listingData.houseRules.parties === 'notAllow' ? 'close' : 'check'}-circle-line ${listingData.houseRules.parties === 'notAllow' ? 'not-allowed' : 'allowed'}`}></i>
              {listingData.houseRules.parties === 'notAllow' ? 'No parties or events' : listingData.houseRules.parties === 'charge' ? 'Parties (extra charge)' : 'Parties allowed'}
            </div>
            {listingData.additionalRules && listingData.additionalRules.length > 0 && (
              listingData.additionalRules.map((rule, idx) => (
                <div key={idx} className="preview-rule">
                  <i className="ri-information-line" style={{ color: '#666' }}></i>
                  {rule}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stay Duration */}
        {(listingData.nightsMin > 0 || listingData.nightsMax > 0) && (
          <div className="preview-section">
            <div className="preview-section-title">Stay Duration</div>
            <p style={{ fontSize: '14px', color: '#555' }}>
              {listingData.nightsMin > 0 && `Min ${listingData.nightsMin} night${listingData.nightsMin > 1 ? 's' : ''}`}
              {listingData.nightsMin > 0 && listingData.nightsMax > 0 && ' • '}
              {listingData.nightsMax > 0 && `Max ${listingData.nightsMax} night${listingData.nightsMax > 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingPreview;
