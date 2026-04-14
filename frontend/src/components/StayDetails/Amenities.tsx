"use client";

interface AmenitiesProps {
  amenities: Record<string, boolean>;
}

const amenityIcons: Record<string, string> = {
  'wifi': 'ri-wifi-line',
  'parking': 'ri-parking-box-line',
  'pool': 'ri-water-flash-line',
  'gym': 'ri-run-line',
  'restaurant': 'ri-restaurant-line',
  'bar': 'ri-goblet-line',
  'spa': 'ri-heart-pulse-line',
  'air_conditioning': 'ri-temp-cold-line',
  'room_service': 'ri-service-line',
  'laundry': 'ri-t-shirt-line',
  'concierge': 'ri-customer-service-line',
  'elevator': 'ri-arrow-up-down-line',
  'wheelchair_accessible': 'ri-wheelchair-line',
  'pet_friendly': 'ri-bear-smile-line',
  'smoking_area': 'ri-smoke-line',
  'non_smoking': 'ri-forbid-line',
  'tv': 'ri-tv-line',
  'minibar': 'ri-fridge-line',
  'safe': 'ri-safe-line',
  'balcony': 'ri-door-open-line',
};

const amenityLabels: Record<string, string> = {
  'wifi': 'Free WiFi',
  'parking': 'Free Parking',
  'pool': 'Swimming Pool',
  'gym': 'Fitness Center',
  'restaurant': 'Restaurant',
  'bar': 'Bar/Lounge',
  'spa': 'Spa',
  'air_conditioning': 'Air Conditioning',
  'room_service': '24/7 Room Service',
  'laundry': 'Laundry Service',
  'concierge': 'Concierge',
  'elevator': 'Elevator',
  'wheelchair_accessible': 'Wheelchair Accessible',
  'pet_friendly': 'Pet Friendly',
  'smoking_area': 'Smoking Area',
  'non_smoking': 'Non-Smoking Rooms',
  'tv': 'TV',
  'minibar': 'Minibar',
  'safe': 'In-room Safe',
  'balcony': 'Balcony',
};

const Amenities: React.FC<AmenitiesProps> = ({ amenities }) => {
  const availableAmenities = Object.entries(amenities)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([key]) => key);

  if (availableAmenities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="stay-amenities box-style mb-4">
        <div className="box-title">
          <h4>Amenities</h4>
          <p>About the property&apos;s amenities and services</p>
        </div>

        <div className="row">
          {availableAmenities.map((amenity) => (
            <div key={amenity} className="col-lg-4 col-sm-6">
              <div className="d-flex align-items-center mb-25">
                <i 
                  className={amenityIcons[amenity] || 'ri-check-line'} 
                  style={{ fontSize: '20px', color: '#10B981' }}
                ></i>
                <span className="ms-3">{amenityLabels[amenity] || amenity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Amenities;
