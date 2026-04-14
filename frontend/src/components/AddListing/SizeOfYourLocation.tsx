"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const facilitiesList = [
  { id: 'wifi', label: 'Free WiFi', icon: 'ri-wifi-line' },
  { id: 'parking', label: 'Parking', icon: 'ri-parking-line' },
  { id: 'restaurant', label: 'Restaurant', icon: 'ri-restaurant-line' },
  { id: 'roomService', label: 'Room Service', icon: 'ri-service-line' },
  { id: 'gym', label: 'Gym / Fitness Center', icon: 'ri-run-line' },
  { id: 'pool', label: 'Swimming Pool', icon: 'ri-water-flash-line' },
  { id: 'spa', label: 'Spa & Wellness', icon: 'ri-leaf-line' },
  { id: 'airConditioning', label: 'Air Conditioning', icon: 'ri-temp-cold-line' },
  { id: 'laundry', label: 'Laundry Service', icon: 'ri-t-shirt-line' },
  { id: 'reception24h', label: '24-Hour Reception', icon: 'ri-time-line' },
  { id: 'elevator', label: 'Elevator', icon: 'ri-arrow-up-down-line' },
  { id: 'wheelchairAccess', label: 'Wheelchair Accessible', icon: 'ri-wheelchair-line' },
  { id: 'prayerRoom', label: 'Prayer Room', icon: 'ri-home-heart-line' },
  { id: 'shuttleService', label: 'Shuttle Service', icon: 'ri-bus-line' },
  { id: 'concierge', label: 'Concierge', icon: 'ri-user-star-line' },
  { id: 'businessCenter', label: 'Business Center', icon: 'ri-briefcase-line' },
  { id: 'meetingRooms', label: 'Meeting Rooms', icon: 'ri-team-line' },
  { id: 'safe', label: 'Safe Deposit Box', icon: 'ri-safe-line' },
  { id: 'currencyExchange', label: 'Currency Exchange', icon: 'ri-exchange-dollar-line' },
  { id: 'atm', label: 'ATM on Site', icon: 'ri-bank-card-line' },
];

const Facilities = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(listingData.facilities || []);

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({ facilities: selectedFacilities });
  }, [selectedFacilities]);

  const toggleFacility = (id: string) => {
    setSelectedFacilities(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    updateListing({ facilities: selectedFacilities });
    router.push('/add-listing/four');
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form">
              <h4>Create Listing - Facilities</h4>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Select the facilities available at your property
              </p>

              <div className="row">
                {facilitiesList.map(facility => (
                  <div key={facility.id} className="col-md-6 col-lg-4 mb-3">
                    <div 
                      className={`facility-card ${selectedFacilities.includes(facility.id) ? 'selected' : ''}`}
                      onClick={() => toggleFacility(facility.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        border: selectedFacilities.includes(facility.id) ? '2px solid #ff6b35' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedFacilities.includes(facility.id) ? '#fff8f5' : '#fff',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <i 
                        className={facility.icon} 
                        style={{ 
                          fontSize: '20px', 
                          color: selectedFacilities.includes(facility.id) ? '#ff6b35' : '#666' 
                        }}
                      />
                      <span style={{ 
                        fontSize: '14px', 
                        color: selectedFacilities.includes(facility.id) ? '#ff6b35' : '#333',
                        fontWeight: selectedFacilities.includes(facility.id) ? '500' : '400'
                      }}>
                        {facility.label}
                      </span>
                      {selectedFacilities.includes(facility.id) && (
                        <i className="ri-check-line" style={{ marginLeft: 'auto', color: '#ff6b35' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', fontSize: '13px', color: '#888' }}>
                {selectedFacilities.length} facilities selected
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing')}
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="default-btn active rounded-10"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Facilities;
