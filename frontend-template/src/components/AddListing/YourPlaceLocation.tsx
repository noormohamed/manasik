"use client";
 
import Link from "next/link";
  
const YourPlaceLocation = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form">
              <h4>Your Place Location</h4>

              <div className="form-group d-inline-block">
                <span className="d-flex align-items-center property">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0C4.691 0 2 2.691 2 6C2 10.159 7.416 15.623 7.646 15.854C7.744 15.951 7.872 16 8 16C8.128 16 8.256 15.951 8.354 15.854C8.584 15.623 14 10.159 14 6C14 2.691 11.309 0 8 0ZM8 14.777C6.806 13.499 3 9.177 3 6C3 3.243 5.243 1 8 1C10.757 1 13 3.243 13 6C13 9.174 9.194 13.499 8 14.777Z" fill="#555555"/>
                    <path d="M8 3C6.346 3 5 4.346 5 6C5 7.654 6.346 9 8 9C9.654 9 11 7.654 11 6C11 4.346 9.654 3 8 3ZM8 8C6.897 8 6 7.103 6 6C6 4.897 6.897 4 8 4C9.103 4 10 4.897 10 6C10 7.103 9.103 8 8 8Z" fill="#555555"/>
                  </svg>
                  Use current location
                </span>
              </div>

              <div className="form-group">
                <label>Country/Region</label>
                <select className="form-select form-control" aria-label="Default select example">
                  <option defaultValue="0">Thailand</option>
                  <option defaultValue="1">Canada</option>
                  <option defaultValue="2">Unitede Kingdom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Street</label>
                <input type="text" className="form-control" placeholder="..." />
                <p className="mt-2">A catchy name usually includes: House name + Room name + Featured property + Tourist destination</p>
              </div>

              <div className="form-group">
                <label>Room number (optional)</label>
                <input type="text" className="form-control" />
              </div>

              <div className="row">
                <div className="col-lg-4">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" className="form-control" />
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group mb-0">
                  <label className="mb-0">Detailed address</label>
                  <span className="mt-0 mb-3">1110 Pennsylvania Avenue NW, Washington, DC 20230</span>

                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d206253.56867320824!2d-115.4868161862367!3d36.12487333558106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80beb782a4f57dd1%3A0x3accd5e6d5b379a3!2sLas%20Vegas%2C%20NV%2C%20USA!5e0!3m2!1sen!2sbd!4v1694402381962!5m2!1sen!2sbd"></iframe>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link href="/add-listing" className="default-btn white-btn rounded-10">
                Go Back
              </Link>
              <Link href="/add-listing/three" className="default-btn active rounded-10">
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default YourPlaceLocation;
