'use client';

import React, {createContext, useState, useEffect, ReactNode} from 'react';
import {apiClient} from '@/lib/api';

export interface Hotel {
    id: string;
    companyId: string;
    companyName: string;
    adminRole: 'OWNER' | 'MANAGER' | 'SUPPORT';
    agentId: string;
    name: string;
    description: string;
    status: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number | null;
    longitude: number | null;
    starRating: number;
    totalRooms: number;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string | null;
    averageRating: number;
    totalReviews: number;
    images: string[];
    createdAt: string;
    updatedAt: string;
    rooms?: RoomType[];
}

export interface RoomType {
    id: string;
    hotelId: string;
    name: string;
    description: string;
    capacity: number;
    totalRooms: number;
    availableRooms: number;
    basePrice: number;
    currency: string;
    status: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface HotelContextType {
    hotels: Hotel[];
    loading: boolean;
    error: string | null;
    fetchListings: (includeRooms?: boolean) => Promise<void>;
    refreshListings: () => Promise<void>;
}

export const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = async (includeRooms: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = includeRooms ? '/hotels/listings?includeRooms=true' : '/hotels/listings';
            const response = await apiClient.get<{
                hotels: Hotel[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    totalPages: number;
                };
            }>(endpoint);

            // The apiClient already unwraps the { data: {...} } structure
            setHotels(response.hotels || []);
        } catch (err: any) {
            console.error('Error fetching listings:', err);
            const errorMsg = err.error || err.message || 'Failed to fetch listings';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshListings = async () => {
        await fetchListings();
    };

    return (
        <HotelContext.Provider
            value={{
                hotels,
                loading,
                error,
                fetchListings,
                refreshListings,
            }}
        >
            {children}
        </HotelContext.Provider>
    );
};
