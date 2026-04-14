"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const YourPlaceLocation = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [street, setStreet] = useState(listingData.street || '');
  const [roomNumber, setRoomNumber] = useState(listingData.roomNumber || '');
  const [city, setCity] = useState(listingData.city || '');
  const [state, setState] = useState(listingData.state || '');
  const [postalCode, setPostalCode] = useState(listingData.postalCode || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({
      street,
      roomNumber,
      city,
      state,
      postalCode,
    });
  }, [street, roomNumber, city, state, postalCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateListing({
        street: street.trim(),
        roomNumber: roomNumber.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      });
      router.push('/add-listing/three');
    }
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form">
              <h4>Create Listing - Location Details</h4>

              <div className="form-group">
                <label>Street<span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                  placeholder="Enter street address"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    if (errors.street) setErrors({ ...errors, street: '' });
                  }}
                />
                {errors.street && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.street}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Room/Unit number (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Suite 100, Floor 2"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="col-lg-4">
                  <div className="form-group">
                    <label>City<span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      placeholder="City"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors({ ...errors, city: '' });
                      }}
                    />
                    {errors.city && (
                      <div className="invalid-feedback" style={{ display: 'block' }}>
                        {errors.city}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="form-group">
                    <label>State/Province</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                </div>
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

export default YourPlaceLocation;
