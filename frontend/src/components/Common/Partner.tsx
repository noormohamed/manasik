"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";

import partnerLogo1 from "/public/images/partner/partner-1.png";
import partnerLogo2 from "/public/images/partner/partner-2.png";
import partnerLogo3 from "/public/images/partner/partner-3.png";
import partnerLogo4 from "/public/images/partner/partner-4.png";
import partnerLogo5 from "/public/images/partner/partner-5.png";

const Partner = () => {
  return (
    <>
      <div className="partner-area">
        <div className="container">
          <div className="section-title">
            <h3>Our Investors and Business Partners Are Our Strength</h3>
          </div>
          <div className="partner-logo text-center m-0">
            <Swiper
              spaceBetween={30}
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
                  slidesPerView: 5,
                },
              }}
              modules={[Autoplay]}
              className="partner-slide"
            >
              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo1} alt="partner" />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo2} alt="partner" />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo3} alt="partner" />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo4} alt="partner" />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo5} alt="partner" />
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="text-center m-lg-auto">
                  <Image src={partnerLogo3} alt="partner" />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partner;
