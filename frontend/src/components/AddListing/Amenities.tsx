"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

const amenitiesList = {
  general: [
    { id: 'wifi', label: 'Wifi' },
    { id: 'airConditioning', label: 'Air conditioning' },
    { id: 'tv', label: 'TV' },
    { id: 'internet', label: 'Internet' },
    { id: 'fan', label: 'Fan' },
    { id: 'heater', label: 'Heater' },
    { id: 'dryer', label: 'Dryer' },
    { id: 'washingMachine', label: 'Washing machine' },
    { id: 'fridge', label: 'Fridge' },
    { id: 'privateEntrance', label: 'Private entrance' },
    { id: 'desk', label: 'Desk' },
    { id: 'babyCot', label: 'Baby cot' },
  ],
  other: [
    { id: 'wardrobe', label: 'Wardrobe' },
    { id: 'gasStove', label: 'Gas stove' },
    { id: 'kettle', label: 'Kettle' },
    { id: 'toaster', label: 'Toaster' },
    { id: 'dishwasher', label: 'Dishwasher' },
    { id: 'towel', label: 'Towel' },
    { id: 'toiletPaper', label: 'Toilet paper' },
    { id: 'freeToiletries', label: 'Free toiletries' },
    { id: 'bbqGrill', label: 'BBQ grill' },
    { id: 'diningTable', label: 'Dining table' },
  ],
  safety: [
    { id: 'fireSiren', label: 'Fire siren' },
    { id: 'fireExtinguisher', label: 'Fire extinguisher' },
    { id: 'safeVault', label: 'Safe vault' },
    { id: 'antiTheftKey', label: 'Anti-theft key' },
  ],
};

const Amenities = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(listingData.amenities || []);

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({ amenities: selectedAmenities });
  }, [selectedAmenities]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    updateListing({ amenities: selectedAmenities });
    router.push('/add-listing/five');
  };

  const renderAmenityCheckbox = (amenity: { id: string; label: string }) => (
    <div className="form-check" key={amenity.id}>
      <input
        className="form-check-input"
        type="checkbox"
        id={amenity.id}
        checked={selectedAmenities.includes(amenity.id)}
        onChange={() => toggleAmenity(amenity.id)}
      />
      <label className="form-check-label" htmlFor={amenity.id}>
        {amenity.label}
      </label>
    </div>
  );

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Create Listing - Amenities</h4>
                <span>Select the amenities available at your property</span>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">General amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.general.slice(0, 4).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.general.slice(4, 8).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.general.slice(8).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Other amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.other.slice(0, 4).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.other.slice(4, 7).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.other.slice(7).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Safety amenities</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.safety.slice(0, 2).map(renderAmenityCheckbox)}
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    {amenitiesList.safety.slice(2).map(renderAmenityCheckbox)}
                  </div>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.push('/add-listing/three')}
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

export default Amenities;
