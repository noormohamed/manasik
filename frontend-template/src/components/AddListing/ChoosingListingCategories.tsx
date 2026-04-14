"use client";
 
import Link from "next/link";
  
const ChoosingListingCategories = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form">
              <h4>Choosing Listing Categories</h4>

              <div className="form-group">
                <label>Choose a property type</label>
                <select
                  className="form-select form-control"
                  aria-label="Default select example"
                >
                  <option defaultValue="0">Hotel</option>
                  <option defaultValue="1">Home</option>
                  <option defaultValue="2">Restaurant</option>
                </select>
                <span>
                  Hotel: Professional hospitality businesses that usually have a
                  unique style or theme defining their brand and decor
                </span>
              </div>

              <div className="form-group">
                <label>Place name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Places name"
                />
                <span>
                  A catchy name usually includes: House name + Room name +
                  Featured property + Tourist destination
                </span>
              </div>

              <div className="form-group mb-0">
                <label>Rental form</label>
                <select
                  className="form-select form-control"
                  aria-label="Default select example"
                >
                  <option defaultValue="0">Entire place</option>
                  <option defaultValue="1">Canada</option>
                  <option defaultValue="2">USA</option>
                </select>
                <span>
                  Entire place: Guests have the whole place to
                  themselves—there a private entrance and no shared spaces. A
                  bedroom, bathroom, and kitchen are usually included.
                </span>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/two"
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

export default ChoosingListingCategories;
