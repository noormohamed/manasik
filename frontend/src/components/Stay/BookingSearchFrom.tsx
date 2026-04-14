"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BookingSearchFrom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    // Navigate to stay page with filters
    router.push(`/stay?${params.toString()}`);
  };

  return (
    <>
      <style jsx>{`
        .location-track .form-group:nth-child(2)::before,
        .location-track .form-group:nth-child(3)::before {
          top: 25%;
          height: 25px;
        }
      `}</style>
      <div className="track-form-area">
        <div className="container">
          <form className="location-track" style={{margin: "0 auto"}} onSubmit={handleSearch}>
            <div className="row align-items-center">
              <div className="col-lg-3 col-sm-6 col-md-3">
                <div className="form-group d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className="flaticon-placeholder"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <span className="title">Location</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City or Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 col-md-3">
                <div className="form-group d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className="flaticon-calendar"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <span className="title">Check In</span>
                    <input 
                      type="date" 
                      className="booking-date form-control" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-md-3">
                <div className="form-group d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className="flaticon-calendar"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <span className="title">Check Out</span>
                    <input 
                      type="date" 
                      className="booking-date form-control" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-md-3">
                <div className="form-group">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className="flaticon-account"></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <span className="title">Guests</span>
                        <select
                          className="form-select" 
                          value={guests}
                          onChange={(e) => setGuests(e.target.value)}
                        >
                          <option value="1">1 Guest</option>
                          <option value="2">2 Guests</option>
                          <option value="3">3 Guests</option>
                          <option value="4">4 Guests</option>
                          <option value="5">5 Guests</option>
                          <option value="6">6 Guests</option>
                          <option value="8">8 Guests</option>
                          <option value="10">10 Guests</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="src-btn">
                      <i className="flaticon-loupe"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookingSearchFrom;
