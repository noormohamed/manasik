"use client";

import React, { useState } from "react";
import Link from "next/link";

const HowLongCanGuestsStay = () => {
  const [nightsMin, setNightsMin] = useState(0);
  const [nightsMax, setNightsMax] = useState(0);

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setter((prevCount) => prevCount + 1);
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setter((prevCount) => (prevCount > 0 ? prevCount - 1 : prevCount));
  };

  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>How long can guests stay?</h4>
                <p>
                  Shorter trips can mean more reservations, but you will turn over
                  your space more often.
                </p>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="mb-0">Nights min</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setNightsMin)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={nightsMin}
                        className="count"
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setNightsMin)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="mb-0">Nights max</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setNightsMax)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={nightsMax}
                        className="count"
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setNightsMax)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-style style-thrre pb-0 mt-5">
                <h4>Set your availability</h4>
                <p>
                  Editing your calendar is easy—just select a date to block or
                  unblock it. You can always make changes after you publish.
                </p>
              </div>

              <div className="form-group mb-0">
                <label>Set a Calendar</label>
                <input type="date" className="form-control" />
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/eight"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/ten"
                className="default-btn active rounded-10"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowLongCanGuestsStay;
