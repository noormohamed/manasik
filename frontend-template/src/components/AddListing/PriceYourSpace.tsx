"use client";

import Link from "next/link";

const PriceYourSpace = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Price your space</h4>
                <p>
                  The host revenue is directly dependent on the setting of
                  rates and regulations on the number of guests, the number of
                  nights, and the cancellation policy.
                </p>
              </div>

              <div className="form-group">
                <label className="mb-3">Currency</label>
                <select
                  className="form-select form-control"
                  aria-label="Default select example"
                >
                  <option defaultValue="0">USD</option>
                  <option defaultValue="1">ERO</option>
                  <option defaultValue="2">Dinar</option>
                  <option defaultValue="3">Pound</option>
                </select>
              </div>

              <div className="form-group">
                <label className="mb-3">Base price (Monday -Thuday)</label>
                <div className="input-group">
                  <span className="input-group-text">$ 0.00</span>
                  <input
                    type="text"
                    className="form-control"
                    aria-label="Amount (to the nearest dollar)"
                  />
                  <span className="input-group-text">USD</span>
                </div>
              </div>

              <div className="form-group">
                <label className="mb-3">Base price (Friday-Sunday)</label>
                <div className="input-group">
                  <span className="input-group-text">$ 0.00</span>
                  <input
                    type="text"
                    className="form-control"
                    aria-label="Amount (to the nearest dollar)"
                  />
                  <span className="input-group-text">USD</span>
                </div>
              </div>

              <div className="form-group">
                <label className="mb-3">
                  Long term price (Monthly discount)
                </label>
                <div className="input-group">
                  <span className="input-group-text">% 0.00</span>
                  <input
                    type="text"
                    className="form-control"
                    aria-label="Amount (to the nearest dollar)"
                  />
                  <span className="input-group-text">every month</span>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/seven"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/nine"
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

export default PriceYourSpace;
