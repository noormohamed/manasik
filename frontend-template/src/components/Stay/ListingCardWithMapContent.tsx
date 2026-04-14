"use client";

import Link from "next/link";
import Image from "next/image";

import placeImg1 from "/public/images/popular/popular-7.jpg";
import placeImg2 from "/public/images/popular/popular-8.jpg";
import placeImg3 from "/public/images/popular/popular-9.jpg";
import placeImg4 from "/public/images/popular/popular-10.jpg";
import placeImg5 from "/public/images/popular/popular-11.jpg";
import placeImg6 from "/public/images/popular/popular-12.jpg";
import FilterHeader from "./FilterHeader";
import GoogleMap from "./GoogleMap";

const ListingCardWithMapContent = () => {
  return (
    <>
      <div className="most-popular-area ptb-175">
        <div className="container">
          {/* FilterHeader */}
          <FilterHeader />

          <div className="row justify-content-center">
            <div className="row">
              <div className="col-xl-8">
                <div className="row justify-content-center">
                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
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
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
                      <div className="most-popular-single-img position-relative">
                        <Link href="/stay-details">
                          <Image src={placeImg2} alt="place" />
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
                          <Link href="/stay-details">
                            Java Bali One Life Adventures
                          </Link>
                        </h3>

                        <div className="d-flex align-items-center most-popular-single-location">
                          <i className="flaticon-location"></i>
                          <span>The Grand Palace</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                          <p>
                            <span className="title">$452</span> / Per Person
                          </p>
                          <p>3 Days/6 Night</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
                      <div className="most-popular-single-img position-relative">
                        <Link href="/stay-details">
                          <Image src={placeImg3} alt="place" />
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
                          <Link href="/stay-details">
                            Yucatan Peninsula Caribbean
                          </Link>
                        </h3>

                        <div className="d-flex align-items-center most-popular-single-location">
                          <i className="flaticon-location"></i>
                          <span>Khao Sok National Park</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                          <p>
                            <span className="title">$380</span> / Per Person
                          </p>
                          <p>2 Days/5 Night</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
                      <div className="most-popular-single-img position-relative">
                        <Link href="/stay-details">
                          <Image src={placeImg4} alt="place" />
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
                          <Link href="/stay-details">Mykonos And Santorini Tour</Link>
                        </h3>

                        <div className="d-flex align-items-center most-popular-single-location">
                          <i className="flaticon-location"></i>
                          <span>Mueang Chiang Rai</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                          <p>
                            <span className="title">$621</span> / Per Person
                          </p>
                          <p>5 Days/7 Night</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
                      <div className="most-popular-single-img position-relative">
                        <Link href="/stay-details">
                          <Image src={placeImg5} alt="place" />
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
                          <Link href="/stay-details">
                            Los Glaciares & Fitz Roy Trip
                          </Link>
                        </h3>

                        <div className="d-flex align-items-center most-popular-single-location">
                          <i className="flaticon-location"></i>
                          <span>Phra Nakhon Si Ayutthaya</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                          <p>
                            <span className="title">$510</span> / Per Person
                          </p>
                          <p>3 Days/6 Night</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-md-6">
                    <div className="most-popular-single-item">
                      <div className="most-popular-single-img position-relative">
                        <Link href="/stay-details">
                          <Image src={placeImg6} alt="place" />
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
                          <Link href="/stay-details">Best Western Caders Hotel</Link>
                        </h3>

                        <div className="d-flex align-items-center most-popular-single-location">
                          <i className="flaticon-location"></i>
                          <span>Chatuchak Weekend Market</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                          <p>
                            <span className="title">$180</span> / Per Person
                          </p>
                          <p>4 Days/6 Night</p>
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

              <div className="col-xl-4">
                {/* GoogleMap */}
                <GoogleMap /> 
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ListingCardWithMapContent;
