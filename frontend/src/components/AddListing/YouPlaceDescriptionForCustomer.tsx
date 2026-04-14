"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const YouPlaceDescriptionForCustomer = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [description, setDescription] = useState(listingData.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({ description });
  }, [description]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateListing({ description: description.trim() });
      router.push('/add-listing/seven');
    }
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Create Listing - Description</h4>
                <p>
                  Write a compelling description to help guests understand what makes your property special.
                </p>
              </div>
              
              <div className="form-group">
                <label>Property Description<span style={{ color: '#dc3545' }}>*</span></label>
                <textarea
                  cols={30}
                  rows={12}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Describe your property, its unique features, nearby attractions, and what guests can expect during their stay..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  maxLength={2000}
                />
                {errors.description && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.description}
                  </div>
                )}
                <div className="d-flex justify-content-between mt-2">
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    Minimum 50 characters
                  </span>
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    {description.length}/2000
                  </span>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/five')}
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

export default YouPlaceDescriptionForCustomer;
