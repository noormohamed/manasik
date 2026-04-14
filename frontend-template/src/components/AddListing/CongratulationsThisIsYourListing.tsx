"use client";

import Link from "next/link";
import Image from "next/image";

import placeImg1 from "/public/images/popular/popular-7.jpg";

const CongratulationsThisIsYourListing = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Congratulations</h4>
                <p>
                  Excellent, congratulations on completing the listing, it is
                  waiting to be reviewed for publication
                </p>
              </div>

              <div>
                <h6 className="mb-3">This is your listing</h6>

                <div className="most-popular-single-item mw-424">
                  <div className="most-popular-single-img position-relative">
                    <Link href="/stay-details">
                      <Image src={placeImg1} alt="place" />
                    </Link>
                    <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                      {/* Before favorite */}
                      <button type="button" className="heart">
                        <i className="flaticon-heart"></i>
                      </button>

                      {/* After favorite */}
                      {/* <button type="button" className="heart favorite">
                        <i className="flaticon-heart"></i>
                      </button> */}

                      <span className="discount">-10% Today</span>
                    </div>
                  </div>

                  <div className="most-popular-single-content">
                    <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <i className="ri-star-fill"></i>
                      </li>
                      <li>
                        <span>(5k+ Rating)</span>
                      </li>
                    </ul>
                    <h3>
                      <Link href="/stay-details">Khao Yai National Park</Link>
                    </h3>

                    <div className="d-flex align-items-center most-popular-single-location">
                      <i className="flaticon-location"></i>
                      <span>Chiang Mai Locality</span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                      <p>
                        <span className="title">$150</span> / Per Person
                      </p>
                      <p>3 Days/6 Night</p>
                    </div>
                  </div>
                </div>

                <div className="choosing-btn text-start">
                  <Link
                    href="/add-listing"
                    className="default-btn white-btn rounded-10"
                  >
                    Edit
                  </Link>
                  <Link href="#" className="default-btn active rounded-10">
                    Preview
                  </Link>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/eight"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <button
                type="submit"
                className="default-btn active rounded-10 border-0"
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CongratulationsThisIsYourListing;
