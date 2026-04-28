"use client";

import Link from "next/link";
import Image from "next/image";

import { ScoringBreakdown, scoreColour } from '@/types/scoring';

export interface HotelCardData {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  minPrice?: number;
  walkingTimeToHaram?: number;
  distanceToHaramMeters?: number;
  viewType?: 'kaaba' | 'partial_haram' | 'city' | 'none';
  isElderlyFriendly: boolean;
  hasFamilyRooms: boolean;
  manasikScore?: number;
  scoringBreakdown?: ScoringBreakdown | null;
  bestForTags: string[];
  images: Array<{ id: string; url: string }>;
  rooms: Array<{ id: string; name: string; basePrice: number; currency: string }>;
}

interface HotelCardProps {
  hotel: HotelCardData;
  nights?: number;
}

const VIEW_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  kaaba: { label: 'Kaaba View', icon: '🕋' },
  partial_haram: { label: 'Partial Haram', icon: '🌙' },
  city: { label: 'City View', icon: '🏙️' },
  none: { label: '', icon: '' },
};

const HotelCard = ({ hotel, nights }: HotelCardProps) => {
  const imageUrl = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : '/images/popular/popular-7.jpg';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}>★</span>
    ));
  };

  const getPriceDisplay = () => {
    if (!hotel.minPrice) return null;
    
    if (nights && nights > 0) {
      const totalPrice = hotel.minPrice * nights;
      return {
        total: totalPrice.toFixed(0),
        perNight: hotel.minPrice.toFixed(0),
        nights,
      };
    }
    
    return {
      total: null,
      perNight: hotel.minPrice.toFixed(0),
      nights: null,
    };
  };

  const priceDisplay = getPriceDisplay();
  const viewTypeInfo = hotel.viewType ? VIEW_TYPE_LABELS[hotel.viewType] : null;

  return (
    <div className="hotel-card">
      <style jsx>{`
        .hotel-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .hotel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .hotel-card:hover .card-image img {
          transform: scale(1.05);
        }

        .image-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #333;
          backdrop-filter: blur(4px);
        }

        .badge.manasik {
          background: #10b981;
          color: white;
        }

        .badge.view {
          background: rgba(0, 0, 0, 0.7);
          color: white;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .favorite-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .favorite-btn i {
          font-size: 18px;
          color: #666;
        }

        .card-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .hotel-name {
          font-size: 16px;
          font-weight: 700;
          color: #111;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .hotel-name a {
          color: inherit;
          text-decoration: none;
        }

        .hotel-name a:hover {
          color: #ff621f;
        }

        .hotel-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .hotel-location i {
          color: #ff621f;
        }

        .stars-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #ddd;
          font-size: 14px;
        }

        .star.filled {
          color: #fbbf24;
        }

        .review-count {
          font-size: 12px;
          color: #666;
        }

        .hajj-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          padding-top: 10px;
          border-top: 1px solid #f0f0f0;
        }

        .hajj-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #f0f9ff;
          border-radius: 4px;
          font-size: 11px;
          color: #0369a1;
        }

        .hajj-badge.walking {
          background: #ecfdf5;
          color: #047857;
        }

        .hajj-badge.elderly {
          background: #fef3c7;
          color: #92400e;
        }

        .hajj-badge.family {
          background: #fce7f3;
          color: #9d174d;
        }

        .best-for-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 12px;
        }

        .best-for-tag {
          font-size: 10px;
          padding: 2px 6px;
          background: #f3f4f6;
          border-radius: 3px;
          color: #4b5563;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .price-info {
          display: flex;
          flex-direction: column;
        }

        .price-main {
          font-size: 20px;
          font-weight: 700;
          color: #111;
        }

        .price-detail {
          font-size: 12px;
          color: #666;
        }

        .book-btn {
          padding: 10px 20px;
          background: #ff621f;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .book-btn:hover {
          background: #e55a1c;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="card-image">
        <Link href={`/stay-details/${hotel.id}`}>
          <Image 
            src={imageUrl} 
            alt={hotel.name}
            width={400}
            height={200}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Link>
        
        <div className="image-badges">
          {hotel.manasikScore && (
            <span className="badge manasik">
              ⭐ {hotel.manasikScore.toFixed(1)} Manasik
            </span>
          )}
          {/* Compact 5-category indicator */}
          {hotel.scoringBreakdown && (() => {
            const cats = [
              { key: 'location' as const,           short: 'Loc' },
              { key: 'pilgrimSuitability' as const, short: 'Plg' },
              { key: 'hotelQuality' as const,       short: 'Qty' },
              { key: 'experienceFriction' as const, short: 'Exp' },
              { key: 'userReviews' as const,        short: 'Rev' },
            ];
            return (
              <span
                style={{
                  display: 'flex',
                  gap: 3,
                  padding: '3px 6px',
                  background: 'rgba(0,0,0,0.65)',
                  borderRadius: 4,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {cats.map(({ key }) => {
                  const score = hotel.scoringBreakdown!.categories[key].score;
                  return (
                    <span
                      key={key}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: scoreColour(score),
                        display: 'inline-block',
                      }}
                      title={`${key}: ${score.toFixed(1)}`}
                    />
                  );
                })}
              </span>
            );
          })()}
          {viewTypeInfo && viewTypeInfo.label && (
            <span className="badge view">
              {viewTypeInfo.icon} {viewTypeInfo.label}
            </span>
          )}
        </div>

        <button className="favorite-btn" type="button">
          <i className="ri-heart-line"></i>
        </button>
      </div>

      <div className="card-content">
        <h3 className="hotel-name">
          <Link href={`/stay-details/${hotel.id}`}>{hotel.name}</Link>
        </h3>

        <div className="hotel-location">
          <i className="ri-map-pin-line"></i>
          <span>{hotel.city}, {hotel.country}</span>
        </div>

        <div className="stars-rating">
          <div className="stars">
            {renderStars(hotel.starRating)}
          </div>
          <span className="review-count">
            ({hotel.totalReviews} review{hotel.totalReviews !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Hajj/Umrah specific info */}
        <div className="hajj-info">
          {hotel.walkingTimeToHaram && (
            <span className="hajj-badge walking">
              🚶 {hotel.walkingTimeToHaram} min to Haram
            </span>
          )}
          {hotel.isElderlyFriendly && (
            <span className="hajj-badge elderly">
              ♿ Elderly Friendly
            </span>
          )}
          {hotel.hasFamilyRooms && (
            <span className="hajj-badge family">
              👨‍👩‍👧 Family Rooms
            </span>
          )}
        </div>

        {hotel.bestForTags && hotel.bestForTags.length > 0 && (
          <div className="best-for-tags">
            {hotel.bestForTags.slice(0, 3).map((tag) => (
              <span key={tag} className="best-for-tag">
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div className="price-info">
            {priceDisplay ? (
              <>
                <span className="price-main">
                  ${priceDisplay.total || priceDisplay.perNight}
                </span>
                <span className="price-detail">
                  {priceDisplay.nights 
                    ? `$${priceDisplay.perNight}/night × ${priceDisplay.nights} nights`
                    : 'per night'
                  }
                </span>
              </>
            ) : (
              <span className="price-main">Contact for price</span>
            )}
          </div>
          <Link href={`/stay-details/${hotel.id}`} className="book-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
