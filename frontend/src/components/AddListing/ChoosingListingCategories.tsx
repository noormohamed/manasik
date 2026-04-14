"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";

// Country and town data (alphabetically sorted)
const countryTowns: Record<string, string[]> = {
  'Bahrain': ['Manama', 'Muharraq', 'Riffa'].sort(),
  'Egypt': ['Alexandria', 'Cairo', 'Hurghada', 'Sharm El Sheikh'].sort(),
  'Indonesia': ['Bali', 'Jakarta', 'Surabaya', 'Yogyakarta'].sort(),
  'Jordan': ['Amman', 'Aqaba', 'Petra'].sort(),
  'Kuwait': ['Hawalli', 'Kuwait City', 'Salmiya'].sort(),
  'Malaysia': ['Johor Bahru', 'Kuala Lumpur', 'Langkawi', 'Penang'].sort(),
  'Oman': ['Muscat', 'Salalah', 'Sohar'].sort(),
  'Qatar': ['Al Khor', 'Al Wakrah', 'Doha'].sort(),
  'Saudi Arabia': ['Dammam', 'Jeddah', 'Madinah', 'Makkah', 'Riyadh', 'Taif'].sort(),
  'Turkey': ['Ankara', 'Antalya', 'Istanbul', 'Izmir'].sort(),
  'United Arab Emirates': ['Abu Dhabi', 'Ajman', 'Dubai', 'Sharjah'].sort(),
  'United Kingdom': [
    'Bath', 'Belfast', 'Birmingham', 'Bradford', 'Brighton', 'Bristol',
    'Cambridge', 'Cardiff', 'Coventry', 'Edinburgh', 'Glasgow', 'Leeds',
    'Leicester', 'Liverpool', 'London', 'Manchester', 'Newcastle', 'Nottingham',
    'Oxford', 'Portsmouth', 'Reading', 'Sheffield', 'Southampton', 'York'
  ].sort(),
  'United States': [
    'Albuquerque', 'Atlanta', 'Austin', 'Baltimore', 'Boston', 'Charlotte',
    'Chicago', 'Cleveland', 'Columbus', 'Dallas', 'Denver', 'Detroit',
    'Fort Worth', 'Fresno', 'Honolulu', 'Houston', 'Indianapolis', 'Jacksonville',
    'Las Vegas', 'Los Angeles', 'Louisville', 'Memphis', 'Miami', 'Milwaukee',
    'Minneapolis', 'Nashville', 'New Orleans', 'New York', 'Orlando', 'Philadelphia',
    'Phoenix', 'Portland', 'Sacramento', 'San Antonio', 'San Diego', 'San Francisco',
    'San Jose', 'Seattle', 'Tampa', 'Tucson', 'Washington DC'
  ].sort(),
};

const ChoosingListingCategories = () => {
  const router = useRouter();
  const { listingData, updateListing, setCurrentStep } = useListing();
  
  const [propertyType, setPropertyType] = useState(listingData.propertyType || 'hotel');
  const [placeName, setPlaceName] = useState(listingData.placeName || '');
  const [selectedCountry, setSelectedCountry] = useState(listingData.country || 'Saudi Arabia');
  const [selectedTown, setSelectedTown] = useState(listingData.town || 'Makkah');
  const [locationLabel, setLocationLabel] = useState(listingData.locationLabel || 'Makkah, Saudi Arabia');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  // Update preview in real-time
  useEffect(() => {
    updateListing({
      propertyType,
      placeName,
      country: selectedCountry,
      town: selectedTown,
      locationLabel,
    });
  }, [propertyType, placeName, selectedCountry, selectedTown, locationLabel]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const towns = countryTowns[country] || [];
    const newTown = towns[0] || '';
    setSelectedTown(newTown);
    // Update location label with new template
    setLocationLabel(`${newTown}, ${country}`);
  };

  const handleTownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const town = e.target.value;
    setSelectedTown(town);
    // Update location label with new template
    setLocationLabel(`${town}, ${selectedCountry}`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!placeName.trim()) {
      newErrors.placeName = 'Place name is required';
    } else if (placeName.trim().length < 3) {
      newErrors.placeName = 'Place name must be at least 3 characters';
    } else if (placeName.trim().length > 100) {
      newErrors.placeName = 'Place name must be less than 100 characters';
    }

    if (!selectedCountry) {
      newErrors.country = 'Please select a country';
    }

    if (!selectedTown) {
      newErrors.town = 'Please select a town/city';
    }

    if (!locationLabel.trim()) {
      newErrors.locationLabel = 'Location label is required';
    } else if (locationLabel.trim().length < 3) {
      newErrors.locationLabel = 'Location label must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateListing({
        propertyType,
        placeName: placeName.trim(),
        country: selectedCountry,
        town: selectedTown,
        locationLabel: locationLabel.trim(),
      });
      router.push('/add-listing/three');
    }
  };

  const towns = countryTowns[selectedCountry] || [];

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form">
              <h4>Create Listing</h4>

              <div className="form-group">
                <label>Choose a property type</label>
                <select
                  className="form-select form-control"
                  aria-label="Property type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="hotel">Hotel</option>
                  <option value="home">Home</option>
                  <option value="restaurant">Restaurant</option>
                </select>
                <span>
                  Hotel: Professional hospitality businesses that usually have a
                  unique style or theme defining their brand and decor
                </span>
              </div>

              <div className="form-group">
                <label>Place name<span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.placeName ? 'is-invalid' : ''}`}
                  placeholder="Enter your place name"
                  value={placeName}
                  onChange={(e) => {
                    setPlaceName(e.target.value);
                    if (errors.placeName) {
                      setErrors({ ...errors, placeName: '' });
                    }
                  }}
                  maxLength={100}
                />
                {errors.placeName && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.placeName}
                  </div>
                )}
                <span>
                  A catchy name usually includes: House name + Room name +
                  Featured property + Tourist destination
                </span>
              </div>

              <div className="form-group">
                <label>Country<span style={{ color: '#dc3545' }}>*</span></label>
                <select
                  className={`form-select form-control ${errors.country ? 'is-invalid' : ''}`}
                  aria-label="Select country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  {Object.keys(countryTowns).sort().map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.country}
                  </div>
                )}
                <span>
                  Used for search filtering.
                </span>
              </div>

              <div className="form-group">
                <label>Town / City<span style={{ color: '#dc3545' }}>*</span></label>
                <select
                  className={`form-select form-control ${errors.town ? 'is-invalid' : ''}`}
                  aria-label="Select town"
                  value={selectedTown}
                  onChange={handleTownChange}
                >
                  {towns.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
                {errors.town && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.town}
                  </div>
                )}
                <span>
                  Used for search filtering.
                </span>
              </div>

              <div className="form-group mb-0">
                <label>Location Label<span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.locationLabel ? 'is-invalid' : ''}`}
                  placeholder="e.g. Near Haram Gate, Makkah"
                  value={locationLabel}
                  onChange={(e) => {
                    setLocationLabel(e.target.value);
                    if (errors.locationLabel) {
                      setErrors({ ...errors, locationLabel: '' });
                    }
                  }}
                  maxLength={150}
                />
                {errors.locationLabel && (
                  <div className="invalid-feedback" style={{ display: 'block' }}>
                    {errors.locationLabel}
                  </div>
                )}
                <span>
                  Displayed to guests. Add landmarks or details for a more specific location description.
                </span>
              </div>
            </form>

            <div className="choosing-btn">
              <button
                type="button"
                onClick={() => router.back()}
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

export default ChoosingListingCategories;
