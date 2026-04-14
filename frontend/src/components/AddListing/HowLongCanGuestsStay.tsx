"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const HowLongCanGuestsStay = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [nightsMin, setNightsMin] = useState(listingData.nightsMin || 1);
  const [nightsMax, setNightsMax] = useState(listingData.nightsMax || 30);
  const [availableFrom, setAvailableFrom] = useState(listingData.availableFrom || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({
      nightsMin,
      nightsMax,
      availableFrom,
    });
  }, [nightsMin, nightsMax, availableFrom]);

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, max?: number) => {
    setter((prevCount) => max ? Math.min(prevCount + 1, max) : prevCount + 1);
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, min: number = 0) => {
    setter((prevCount) => Math.max(prevCount - 1, min));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (nightsMin < 1) {
      newErrors.nightsMin = 'Minimum nights must be at least 1';
    }

    if (nightsMax < nightsMin) {
      newErrors.nightsMax = 'Maximum nights must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateListing({
        nightsMin,
        nightsMax,
        availableFrom,
      });
      router.push('/add-listing/ten');
    }
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Create Listing - Stay Duration</h4>
                <p>
                  Set minimum and maximum stay requirements for your property.
                </p>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <label className="mb-0">Minimum nights<span style={{ color: '#dc3545' }}>*</span></label>
                    <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                      Shorter stays mean more turnover
                    </p>
                  </div>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button type="button" className="minusBtn" onClick={() => handleDecrement(setNightsMin, 1)}>-</button>
                      <input type="text" value={nightsMin} className="count" readOnly />
                      <button type="button" className="plusBtn" onClick={() => handleIncrement(setNightsMin)}>+</button>
                    </div>
                  </div>
                </div>
                {errors.nightsMin && <div className="text-danger mt-1" style={{ fontSize: '14px' }}>{errors.nightsMin}</div>}
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <label className="mb-0">Maximum nights</label>
                    <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                      Longer stays provide stability
                    </p>
                  </div>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button type="button" className="minusBtn" onClick={() => handleDecrement(setNightsMax, nightsMin)}>-</button>
                      <input type="text" value={nightsMax} className="count" readOnly />
                      <button type="button" className="plusBtn" onClick={() => handleIncrement(setNightsMax, 365)}>+</button>
                    </div>
                  </div>
                </div>
                {errors.nightsMax && <div className="text-danger mt-1" style={{ fontSize: '14px' }}>{errors.nightsMax}</div>}
              </div>

              <div className="border-style style-three pb-0 mt-5">
                <h4>Availability</h4>
                <p>
                  When can guests start booking your property?
                </p>
              </div>

              <div className="form-group mb-0">
                <label>Available from</label>
                <input
                  type="date"
                  className="form-control"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <span style={{ fontSize: '13px', color: '#888' }}>
                  Leave empty to make available immediately
                </span>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/eight')}
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

export default HowLongCanGuestsStay;
