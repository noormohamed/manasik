"use client";

import { useState, useEffect, useRef } from "react";
import { HotelCardData } from "./HotelCard";

interface HotelMapViewProps {
  hotels: HotelCardData[];
  selectedHotelId?: string;
  onHotelSelect?: (hotelId: string) => void;
}

const HotelMapView = ({ hotels, selectedHotelId, onHotelSelect }: HotelMapViewProps) => {
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Default center on Makkah (Haram)
  const defaultCenter = { lat: 21.4225, lng: 39.8262 };

  // Calculate map bounds based on hotels
  const getMapBounds = () => {
    if (hotels.length === 0) return defaultCenter;
    
    const validHotels = hotels.filter(h => h.latitude && h.longitude);
    if (validHotels.length === 0) return defaultCenter;

    const lats = validHotels.map(h => h.latitude!);
    const lngs = validHotels.map(h => h.longitude!);
    
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  };

  const center = getMapBounds();

  // For now, we'll use a static map with markers overlay
  // In production, you'd integrate with Google Maps or Mapbox
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14856.!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1694342704402!5m2!1sen!2s`;

  return (
    <div className="hotel-map-view">
      <style jsx>{`
        .hotel-map-view {
          position: relative;
          height: 100%;
          min-height: 600px;
          border-radius: 12px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .map-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .map-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .map-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .hotel-markers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .hotel-list-sidebar {
          position: absolute;
          top: 16px;
          left: 16px;
          bottom: 16px;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          background: #f8f9fa;
        }

        .sidebar-header h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: #111;
        }

        .sidebar-header p {
          font-size: 13px;
          color: #666;
          margin: 4px 0 0 0;
        }

        .hotel-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .hotel-list-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .hotel-list-item:hover {
          background: #f8f9fa;
        }

        .hotel-list-item.selected {
          background: #fff5f0;
          border-color: #ff621f;
        }

        .hotel-list-item.hovered {
          background: #f0f9ff;
        }

        .hotel-thumb {
          width: 80px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .hotel-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hotel-info {
          flex: 1;
          min-width: 0;
        }

        .hotel-info h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hotel-info .location {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .hotel-info .details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .hotel-info .walking-time {
          color: #047857;
          font-weight: 500;
        }

        .hotel-info .price {
          color: #ff621f;
          font-weight: 700;
        }

        .map-legend {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #666;
        }

        .legend-item + .legend-item {
          margin-top: 6px;
        }

        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-marker.haram {
          background: #10b981;
        }

        .legend-marker.hotel {
          background: #ff621f;
        }

        @media (max-width: 768px) {
          .hotel-list-sidebar {
            width: 100%;
            left: 0;
            right: 0;
            top: auto;
            bottom: 0;
            height: 40%;
            border-radius: 12px 12px 0 0;
          }
        }
      `}</style>

      <div className="map-container" ref={mapRef}>
        <iframe 
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Hotel Map"
        />
      </div>

      <div className="hotel-list-sidebar">
        <div className="sidebar-header">
          <h3>Hotels on Map</h3>
          <p>{hotels.length} properties</p>
        </div>
        <div className="hotel-list">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className={`hotel-list-item ${selectedHotelId === hotel.id ? 'selected' : ''} ${hoveredHotel === hotel.id ? 'hovered' : ''}`}
              onClick={() => onHotelSelect?.(hotel.id)}
              onMouseEnter={() => setHoveredHotel(hotel.id)}
              onMouseLeave={() => setHoveredHotel(null)}
            >
              <div className="hotel-thumb">
                <img 
                  src={hotel.images?.[0]?.url || '/images/popular/popular-7.jpg'} 
                  alt={hotel.name}
                />
              </div>
              <div className="hotel-info">
                <h4>{hotel.name}</h4>
                <div className="location">{hotel.city}</div>
                <div className="details">
                  {hotel.walkingTimeToHaram && (
                    <span className="walking-time">🚶 {hotel.walkingTimeToHaram} min</span>
                  )}
                  {hotel.minPrice && (
                    <span className="price">${hotel.minPrice}/night</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker haram"></span>
          <span>Masjid al-Haram</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker hotel"></span>
          <span>Hotels</span>
        </div>
      </div>
    </div>
  );
};

export default HotelMapView;
