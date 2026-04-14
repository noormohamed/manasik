"use client";

import Link from "next/link";
import Image from "next/image";
import FilterHeader from "./FilterHeader";

import carImg1 from "/public/images/popular/popular-16.jpg";
import carImg2 from "/public/images/popular/popular-17.jpg";
import carImg3 from "/public/images/popular/popular-18.jpg";
import carImg4 from "/public/images/popular/popular-19.jpg";
import carImg5 from "/public/images/popular/popular-20.jpg";
import carImg6 from "/public/images/popular/popular-21.jpg";

const CarsCardContent = () => {
  return (
    <>
      <div className="most-popular-area ptb-175">
        <div className="container">
          {/* FilterHeader */}
          <FilterHeader />

          <div className="row justify-content-center">
            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg1} alt="place" />
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
                    <Link href="/cars-details">Audi Trone Electric Sport</Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Central Park West Toronto</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$150</span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg2} alt="place" />
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
                      <span>(1k+ Rating)</span>
                    </li>
                  </ul>
                  <h3>
                    <Link href="/cars-details">
                      Volvo Electric Model A10
                    </Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Central Park West Toronto</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$452</span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg3} alt="place" />
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
                      <span>(2k+ Rating)</span>
                    </li>
                  </ul>
                  <h3>
                    <Link href="/cars-details">
                      BMW Electric Model i4
                    </Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Bryce Canyon Central Park</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$380 </span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg4} alt="place" />
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
                      <span>(6k+ Rating)</span>
                    </li>
                  </ul>
                  <h3>
                    <Link href="/cars-details">Hundai Kong GT Sports</Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Central Park West Toronto</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$230 </span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg5} alt="place" />
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
                      <span>(6k+ Rating)</span>
                    </li>
                  </ul>
                  <h3>
                    <Link href="/cars-details">
                      BMW X3 New xdrive
                    </Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Phra Nakhon Si Ayutthaya</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$510 </span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6">
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/cars-details">
                    <Image src={carImg6} alt="place" />
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
                      <span>(1.5k+ Rating)</span>
                    </li>
                  </ul>
                  <h3>
                    <Link href="/cars-details">New 2022 Lexus RC4</Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Chatuchak Weekend Market</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link href="/cars-details" className="white-btn btn-border default-btn">
                      Book Now
                    </Link>
                    <span><span className="title">$600 </span> / Per Person</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="col-lg-12">
              <div className="pagination-area text-center">
                <Link href="#" className="next page-numbers">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_3719_2626)">
                      <path
                        d="M3.60973 7.0177L10.4279 0.199699C10.6941 -0.0665738 11.1259 -0.0665739 11.3921 0.199744C11.6584 0.466017 11.6584 0.897699 11.3921 1.16397L5.05605 7.49988L11.3921 13.8361C11.6584 14.1024 11.6584 14.5341 11.3921 14.8003C11.259 14.9335 11.0845 15 10.91 15C10.7355 15 10.561 14.9335 10.4279 14.8003L3.60973 7.98192C3.48182 7.85406 3.41 7.68065 3.41 7.49983C3.41 7.31902 3.48182 7.14556 3.60973 7.0177Z"
                        fill="#111827"
                      />
                    </g>
                  </svg>
                </Link>

                <span className="page-numbers" aria-current="page">
                  1
                </span>
                <Link href="#" className="page-numbers current">
                  2
                </Link>
                <Link href="#" className="page-numbers">
                  3
                </Link>

                <Link href="#" className="next page-numbers">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_3719_2622)">
                      <path
                        d="M11.3903 7.0177L4.57209 0.199699C4.30587 -0.0665738 3.87414 -0.0665739 3.60787 0.199744C3.34164 0.466017 3.34164 0.897699 3.60791 1.16397L9.94395 7.49988L3.60787 13.8361C3.34164 14.1024 3.34164 14.5341 3.60791 14.8003C3.741 14.9335 3.9155 15 4.09 15C4.2645 15 4.439 14.9335 4.57214 14.8003L11.3903 7.98192C11.5182 7.85406 11.59 7.68065 11.59 7.49983C11.59 7.31901 11.5182 7.14556 11.3903 7.0177Z"
                        fill="#111827"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarsCardContent;
