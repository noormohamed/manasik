"use client";

import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Image from "next/image";

const howItWorksData = [
  {
    id: "1",
    icon: "/images/icons/icon19.png",
    title: "Book & Relax",
    shortText:
      "Lorem ipsum dolor sitameem adipiscing cnsectetur adimod tur adipiscing dolore",
  },
  {
    id: "2",
    icon: "/images/icons/icon20.png",
    title: "Smart Checklist",
    shortText:
      "Lorem ipsum dolor sitameem adipiscing cnsectetur adimod tur adipiscing dolore",
  }, 
  {
    id: "3",
    icon: "/images/icons/icon21.png",
    title: "Reasonable Price",
    shortText:
      "Lorem ipsum dolor sitameem adipiscing cnsectetur adimod tur adipiscing dolore",
  }, 
  {
    id: "4",
    icon: "/images/icons/icon20.png",
    title: "Smart Checklist",
    shortText:
      "Lorem ipsum dolor sitameem adipiscing cnsectetur adimod tur adipiscing dolore",
  }, 
];

const HowItWorks: React.FC = () => {
  return (
    <>
      <div className="how-its-work-area bg-color-f7f2ff pt-175 pb-150">
        <div className="container">
          <div className="section-title">
            <span className="top-title">HOW IT WORKS</span>
            <h2>Let’s Find Your Dream Destination Make With Enjoy</h2>
          </div>

          {howItWorksData && (
            <Swiper
              slidesPerView={1}
              spaceBetween={25}
              pagination={{
                clickable: true,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1, 
                },
                768: {
                  slidesPerView: 1, 
                },
                992: {
                  slidesPerView: 2, 
                }, 
                1200: {
                  slidesPerView: 3, 
                }, 
              }}
              modules={[Pagination]}
              className="how-its-work-slider"
            >
              {howItWorksData && howItWorksData.map((value, i) => (
                <SwiperSlide key={i}>
                  <div className="how-its-work-single-item">
                    <div className="d-sm-flex">
                      <div className="flex-shrink-0">
                        <Image src={value.icon} alt='icon' width={70} height={70} />
                      </div>
                      <div className="flex-grow-1 ms-30">
                        <h4>{value.title}</h4>
                        <p>{value.shortText}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
