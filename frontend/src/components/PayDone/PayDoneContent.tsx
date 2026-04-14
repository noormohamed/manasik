"use client";

import Image from "next/image";

import placeImg from "/public/images/popular/popular-13.jpg";

const PayDoneContent = () => {
  return (
    <>
      <div className="chackout-area ptb-175">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="chackout-content your-booking">
                <h4>Congratulation</h4>
                <h3>Your Booking</h3>

                <div className="d-flex align-items-center mb-40">
                  <div className="flex-shrink-0">
                    <Image
                      src={placeImg}
                      alt="place"
                      style={{ width: '136px', height: '136px', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="flex-grow-1 ms-4">
                    <ul className="ps-0 pe-0 mb-3 list-unstyled d-flex align-items-center">
                      <li className="me-1">
                        <i
                          className="ri-star-fill"
                          style={{ color: "#FFC107", fontSize: "18px" }}
                        ></i>
                      </li>
                      <li className="me-1">
                        <i
                          className="ri-star-fill"
                          style={{ color: "#FFC107", fontSize: "18px" }}
                        ></i>
                      </li>
                      <li className="me-1">
                        <i
                          className="ri-star-fill"
                          style={{ color: "#FFC107", fontSize: "18px" }}
                        ></i>
                      </li>
                      <li className="me-1">
                        <i
                          className="ri-star-fill"
                          style={{ color: "#FFC107", fontSize: "18px" }}
                        ></i>
                      </li>
                      <li className="me-1">
                        <i
                          className="ri-star-fill"
                          style={{ color: "#FFC107", fontSize: "18px" }}
                        ></i>
                      </li>
                    </ul>

                    <span>Hotel room in Tokyo,</span>
                    <h6>The Lounge & Bar</h6>
                    <span>3 beds · 1 baths</span>
                  </div>
                </div>

                <div className="row g-0">
                  <div className="col-lg-6">
                    <div className="date-wrap border-right">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="">
                          <span className="date-title">Date</span>
                          <span className="date">August 06 - August 13</span>
                        </div> 
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="date-wrap">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <span className="date-title">Guests</span>
                          <span className="date">3 Guests, 1 Infants</span>
                        </div> 
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-40"></div>

                <h3>Booking detail</h3>

                <ul className="booking-list ps-0 pe-0 list-unstyled">
                  <li>
                    <span>Booking code</span>
                    #222-333-111
                  </li>
                  <li>
                    <span>Date</span>
                    12 Aug, 2023
                  </li>
                  <li>
                    <span>Total</span>
                    $199
                  </li>
                  <li>
                    <span>Payment method</span>
                    Credit card
                  </li>
                </ul>

                <button
                  type="submit"
                  className="default-btn rounded-10 active border-0"
                >
                  Explore More Stays
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayDoneContent;
