"use client";

import React, { useState } from "react";
import Link from "next/link";

const SizeOfYourLocation = () => {
  const [guests, setGuests] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [beds, setBeds] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [kitchen, setKitchen] = useState(0);

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
            <form className="choosing-form">
              <h4>Size Of Your Location</h4>

              <div className="form-group">
                <label>Acreage (m2)</label>
                <select
                  className="form-select form-control"
                  aria-label="Default select example"
                >
                  <option defaultValue="0">100</option>
                  <option defaultValue="1">200</option>
                  <option defaultValue="2">300</option>
                </select>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label>Guests</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setGuests)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={guests}
                        className="count"
                        readOnly
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setGuests)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label>Bedroom</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setBedrooms)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={bedrooms}
                        className="count"
                        readOnly
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setBedrooms)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label>Beds</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setBeds)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={beds}
                        className="count"
                        readOnly
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setBeds)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label>Bathroom</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setBathrooms)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={bathrooms}
                        className="count"
                        readOnly
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setBathrooms)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group mb-0">
                <div className="d-flex align-items-center justify-content-between">
                  <label>Kitchen</label>
                  <div className="product-quantity">
                    <div className="add-to-cart-counter">
                      <button
                        type="button"
                        className="minusBtn"
                        onClick={() => handleDecrement(setKitchen)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={kitchen}
                        className="count"
                        readOnly
                      />
                      <button
                        type="button"
                        className="plusBtn"
                        onClick={() => handleIncrement(setKitchen)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/two"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/four"
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

export default SizeOfYourLocation;
