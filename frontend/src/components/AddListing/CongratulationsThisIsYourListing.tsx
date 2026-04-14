"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import Link from "next/link";

const CongratulationsThisIsYourListing = () => {
  const router = useRouter();
  const { listingData, resetListing, setCurrentStep } = useListing();

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(9);
  }, [setCurrentStep]);

  const handlePublish = async () => {
    // TODO: Submit listing to API
    console.log('Publishing listing:', listingData);
    
    // For now, just show success and reset
    alert('Listing submitted for review!');
    resetListing();
    router.push('/dashboard/listings');
  };

  const formatPrice = (price: number) => {
    if (!price) return '$0';
    return `$${price.toLocaleString()}`;
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Listing Created!</h4>
                <p>
                  Congratulations! Your listing is ready for review. Once approved, it will be visible to guests.
                </p>
              </div>

              <div>
                <h6 className="mb-3">Listing Summary</h6>

                <div className="card mb-4" style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                  {listingData.coverImage && (
                    <img 
                      src={listingData.coverImage} 
                      alt="Cover" 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body p-4">
                    <h5 style={{ marginBottom: '8px' }}>{listingData.placeName || 'Untitled Property'}</h5>
                    <p style={{ color: '#666', marginBottom: '12px' }}>
                      <i className="ri-map-pin-line me-1"></i>
                      {listingData.locationLabel || `${listingData.town}, ${listingData.country}`}
                    </p>
                    
                    <div className="d-flex gap-3 mb-3" style={{ fontSize: '14px', color: '#555' }}>
                      <span><strong>{listingData.guests || 2}</strong> guests</span>
                      <span><strong>{listingData.bedrooms || 1}</strong> bedrooms</span>
                      <span><strong>{listingData.bathrooms || 1}</strong> bathrooms</span>
                    </div>

                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff6b35' }}>
                      {formatPrice(listingData.basePriceWeekday)}
                      <span style={{ fontSize: '14px', fontWeight: '400', color: '#888' }}> / night</span>
                    </div>

                    {listingData.amenities.length > 0 && (
                      <div className="mt-3">
                        <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Amenities:</p>
                        <div className="d-flex flex-wrap gap-2">
                          {listingData.amenities.slice(0, 5).map(amenity => (
                            <span 
                              key={amenity} 
                              style={{ 
                                background: '#f0f7ff', 
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#0066cc'
                              }}
                            >
                              {amenity.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                          {listingData.amenities.length > 5 && (
                            <span style={{ fontSize: '12px', color: '#888' }}>
                              +{listingData.amenities.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="choosing-btn text-start mb-4">
                  <button
                    type="button"
                    onClick={() => router.push('/add-listing')}
                    className="default-btn white-btn rounded-10"
                  >
                    Edit Listing
                  </button>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/nine')}
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="default-btn active rounded-10 border-0"
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CongratulationsThisIsYourListing;
