"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ListingData {
  // Step 1: Basic Info
  propertyType: string;
  placeName: string;
  country: string;
  town: string;
  locationLabel: string;
  
  // Location details
  street: string;
  roomNumber: string;
  city: string;
  state: string;
  zipCode: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  
  // Property details
  guests: number;
  bedrooms: number;
  bathrooms: number;
  
  // Step 2: Facilities
  facilities: string[];
  
  // Step 3: Amenities (room amenities)
  amenities: string[];
  
  // Step 4: House Rules
  houseRules: {
    smoking: 'allow' | 'notAllow' | 'charge';
    pets: 'allow' | 'notAllow' | 'charge';
    parties: 'allow' | 'notAllow' | 'charge';
    cooking: 'allow' | 'notAllow' | 'charge';
  };
  additionalRules: string[];
  
  // Step 5: Description
  description: string;
  
  // Step 6: Photos
  coverImage: string;
  photos: string[];
  
  // Step 7: Pricing
  currency: string;
  basePriceWeekday: number;
  basePriceWeekend: number;
  monthlyDiscount: number;
  
  // Step 8: Stay Duration
  nightsMin: number;
  nightsMax: number;
  availableFrom: string;
}

const defaultListingData: ListingData = {
  propertyType: 'hotel',
  placeName: '',
  country: 'Saudi Arabia',
  town: 'Makkah',
  locationLabel: 'Makkah, Saudi Arabia',
  street: '',
  roomNumber: '',
  city: '',
  state: '',
  zipCode: '',
  postalCode: '',
  latitude: 0,
  longitude: 0,
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  facilities: [],
  amenities: [],
  houseRules: {
    smoking: 'notAllow',
    pets: 'notAllow',
    parties: 'notAllow',
    cooking: 'allow',
  },
  additionalRules: [],
  description: '',
  coverImage: '',
  photos: [],
  currency: 'USD',
  basePriceWeekday: 0,
  basePriceWeekend: 0,
  monthlyDiscount: 0,
  nightsMin: 1,
  nightsMax: 30,
  availableFrom: '',
};

interface ListingContextType {
  listingData: ListingData;
  updateListing: (data: Partial<ListingData>) => void;
  resetListing: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export function ListingProvider({ children }: { children: ReactNode }) {
  const [listingData, setListingData] = useState<ListingData>(defaultListingData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('listing_data');
      if (saved) {
        try {
          setListingData({ ...defaultListingData, ...JSON.parse(saved) });
        } catch (e) {
          console.error('Failed to parse listing data', e);
        }
      }
      const savedStep = localStorage.getItem('listing_step');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('listing_data', JSON.stringify(listingData));
    }
  }, [listingData, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('listing_step', currentStep.toString());
    }
  }, [currentStep, isLoaded]);

  const updateListing = (data: Partial<ListingData>) => {
    setListingData(prev => ({ ...prev, ...data }));
  };

  const resetListing = () => {
    setListingData(defaultListingData);
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('listing_data');
      localStorage.removeItem('listing_step');
    }
  };

  return (
    <ListingContext.Provider value={{ listingData, updateListing, resetListing, currentStep, setCurrentStep }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListing must be used within a ListingProvider');
  }
  return context;
}
