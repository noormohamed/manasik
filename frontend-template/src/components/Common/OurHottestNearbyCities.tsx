"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import Link from "next/link";
import Image from "next/image";

import destinationImg1 from "/public/images/popular/popular-1.jpg";
import destinationImg2 from "/public/images/popular/popular-2.jpg";
import destinationImg3 from "/public/images/popular/popular-3.jpg";
import destinationImg4 from "/public/images/popular/popular-4.jpg";
import destinationImg5 from "/public/images/popular/popular-5.jpg";
import destinationImg6 from "/public/images/popular/popular-6.jpg";

const OurHottestNearbyCities = () => {
  return (
    <>
      <div className="nearby-cities-area ptb-175">
        <div className="container">
          <div 
            className="mb-30"
          >
            <div className="section-title left-title mb-0">
              <span className="top-title">NEARBY CITIES</span>
              <h2>Our Hottest Nearby Cities</h2>
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
                slidesPerView: 2,
              },
              576: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              1200: {
                slidesPerView: 6,
              },
            }}
            modules={[Autoplay, Navigation]}
            className="destination-slider"
          >
            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg1} alt="destination" />
                <h3>Morocco</h3>
                <span>Starting from $320</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg2} alt="destination" />
                <h3>Tanzania</h3>
                <span>Starting from $148</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg3} alt="destination" />
                <h3>Japan</h3>
                <span>Starting from $460</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg4} alt="destination" />
                <h3>Thailand</h3>
                <span>Starting from $721</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg5} alt="destination" />
                <h3>Italy</h3>
                <span>Starting from $215</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg6} alt="destination" />
                <h3>France</h3>
                <span>Starting from $621</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg1} alt="destination" />
                <h3>Morocco</h3>
                <span>Starting from $320</span>
              </Link>
            </SwiperSlide>

            <SwiperSlide>
              <Link
                href="/stay-details"
                className="nearby-cities-single-item text-center text-decoration-none d-block"
              >
                <Image src={destinationImg2} alt="destination" />
                <h3>Tanzania</h3>
                <span>Starting from $148</span>
              </Link>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default OurHottestNearbyCities;
