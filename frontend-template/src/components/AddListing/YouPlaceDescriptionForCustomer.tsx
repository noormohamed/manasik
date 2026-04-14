"use client";

import Link from "next/link";

const YouPlaceDescriptionForCustomer = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Your Place Description For Customer</h4>
                <p>
                  A few beautiful photos will help customers have more sympathy
                  for your property.
                </p>
              </div>
              <textarea
                cols={30}
                rows={16}
                className="form-control"
                placeholder="Write Something"
              ></textarea>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/five"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/seven"
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

export default YouPlaceDescriptionForCustomer;
