"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const PriceYourSpace = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [currency, setCurrency] = useState(listingData.currency || 'USD');
  const [basePriceWeekday, setBasePriceWeekday] = useState(listingData.basePriceWeekday || 0);
  const [basePriceWeekend, setBasePriceWeekend] = useState(listingData.basePriceWeekend || 0);
  const [monthlyDiscount, setMonthlyDiscount] = useState(listingData.monthlyDiscount || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({
      currency,
      basePriceWeekday,
      basePriceWeekend,
      monthlyDiscount,
    });
  }, [currency, basePriceWeekday, basePriceWeekend, monthlyDiscount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (basePriceWeekday <= 0) {
      newErrors.basePriceWeekday = 'Weekday price is required';
    }

    if (basePriceWeekend <= 0) {
      newErrors.basePriceWeekend = 'Weekend price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateListing({
        currency,
        basePriceWeekday,
        basePriceWeekend,
        monthlyDiscount,
      });
      router.push('/add-listing/nine');
    }
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Create Listing - Pricing</h4>
                <p>
                  Set competitive prices to attract guests. You can adjust these anytime.
                </p>
              </div>

              <div className="form-group">
                <label className="mb-3">Currency</label>
                <select
                  className="form-select form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>

              <div className="form-group">
                <label className="mb-3">Base price (Mon-Thu)<span style={{ color: '#dc3545' }}>*</span></label>
                <div className="input-group">
                  <span className="input-group-text">{currency}</span>
                  <input
                    type="number"
                    className={`form-control ${errors.basePriceWeekday ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    value={basePriceWeekday || ''}
                    onChange={(e) => {
                      setBasePriceWeekday(parseFloat(e.target.value) || 0);
                      if (errors.basePriceWeekday) setErrors({ ...errors, basePriceWeekday: '' });
                    }}
                    min="0"
                    step="0.01"
                  />
                  <span className="input-group-text">/ night</span>
                </div>
                {errors.basePriceWeekday && (
                  <div className="text-danger mt-1" style={{ fontSize: '14px' }}>
                    {errors.basePriceWeekday}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="mb-3">Base price (Fri-Sun)<span style={{ color: '#dc3545' }}>*</span></label>
                <div className="input-group">
                  <span className="input-group-text">{currency}</span>
                  <input
                    type="number"
                    className={`form-control ${errors.basePriceWeekend ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    value={basePriceWeekend || ''}
                    onChange={(e) => {
                      setBasePriceWeekend(parseFloat(e.target.value) || 0);
                      if (errors.basePriceWeekend) setErrors({ ...errors, basePriceWeekend: '' });
                    }}
                    min="0"
                    step="0.01"
                  />
                  <span className="input-group-text">/ night</span>
                </div>
                {errors.basePriceWeekend && (
                  <div className="text-danger mt-1" style={{ fontSize: '14px' }}>
                    {errors.basePriceWeekend}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="mb-3">Monthly discount (optional)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={monthlyDiscount || ''}
                    onChange={(e) => setMonthlyDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                  <span className="input-group-text">%</span>
                </div>
                <span style={{ fontSize: '13px', color: '#888' }}>
                  Offer a discount for stays of 28 nights or more
                </span>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/seven')}
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

export default PriceYourSpace;
