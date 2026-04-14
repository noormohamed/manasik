"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import Image from "next/image";
import Link from "next/link";

import placesImg1 from "/public/images/popular/popular-13.jpg";
import placesImg2 from "/public/images/popular/popular-14.jpg";
import placesImg3 from "/public/images/popular/popular-15.jpg";
import placesImg4 from "/public/images/popular/popular-16.jpg";
import placesImg5 from "/public/images/popular/popular-17.jpg";
import placesImg6 from "/public/images/popular/popular-18.jpg";

const MostPopularPlaces = () => {
  return (
    <>
      <div className="most-popular-area pb-175">
        <div className="container">
          <div className="d-md-flex justify-content-between align-items-center mb-30">
            <div className="section-title mb-0 left-title">
              <span className="top-title">FEATURED PLACES</span>
              <h2>Most Popular Places</h2>
            </div>
          </div>

          <Swiper
            spaceBetween={30}
            navigation={true}
            autoplay={{
              delay: 5000,
              pauseOnMouseEnter: true,
              disableOnInteraction: true,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 3,
              },
            }}
            modules={[Autoplay, Navigation]}
            className="most-popular-slider"
          >
            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg1} alt="popular" />
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
                      <span>(5k+ Rating)</span>
                    </li>
                  </ul>

                  <h3>
                    <Link href="/stay-details">Discovery Islands Kayaking</Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Central Park West USA</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$150</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg2} alt="popular" />
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
                    <span>Central Park West USA</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$452</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg3} alt="popular" />
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
                    <span>Bryce Canyon Central Park</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$380</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg4} alt="popular" />
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
                      <span>(5k+ Rating)</span>
                    </li>
                  </ul>

                  <h3>
                    <Link href="/stay-details">Discovery Islands Kayaking</Link>
                  </h3>

                  <div className="d-flex align-items-center most-popular-single-location">
                    <i className="flaticon-location"></i>
                    <span>Central Park West USA</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$150</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg5} alt="popular" />
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
                    <span>Central Park West USA</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$452</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="most-popular-single-item">
                <div className="most-popular-single-img position-relative">
                  <Link href="/stay-details">
                    <Image src={placesImg6} alt="popular" />
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
                    <span>Bryce Canyon Central Park</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                    <Link
                      href="/stay-details"
                      className="white-btn btn-border default-btn"
                    >
                      Book Now
                    </Link>
                    <span>
                      <span className="title">$380</span> / Per Person
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default MostPopularPlaces;
