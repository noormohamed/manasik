"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";

import testimonialImg from "/public/images/testimonial-img-3.jpg";
import mokaup from "/public/images/mokaup/mokup-10.png";
import shape from "/public/images/shape/shape-17.png";

const testimonialSliderData = [
  {
    id: "1",
    name: "Lonathon Benjamin",
    designation: "Happy Traveler",
    feedbackText:
      "Proin gravida nib velit auctort aenean lorem quis bibendu nis conseq kpsum nec sagittis sem nibh id elit uis sed odio sit cursus molore lorem ipsum dolor sit amet consectetur adipisc elit sed eiuod door tem dolo.",
    rating: [
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
    ],
  },
  {
    id: "2",
    name: "Lathin Dew",
    designation: "Happy Traveler",
    feedbackText:
      "Proin gravida nib velit auctort aenean lorem quis bibendu nis conseq kpsum nec sagittis sem nibh id elit uis sed odio sit cursus molore lorem ipsum dolor sit amet consectetur adipisc elit sed eiuod door tem dolo.",
    rating: [
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
      {
        iconName: "ri-star-fill",
      },
    ],
  },
];

const TestimonialSliderThree: React.FC = () => {
  return (
    <>
      <div className="testimonial-area pt-175">
        <div className="container">
          <div className="section-title">
            <span className="top-title">TESTIMONIAL</span>
            <h2>What Our Users Say About Us</h2>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6">
              {testimonialSliderData && (
                <Swiper
                  spaceBetween={30}
                  navigation={true}
                  autoplay={{
                    delay: 5000,
                    pauseOnMouseEnter: true,
                    disableOnInteraction: true,
                  }}
                  modules={[Autoplay, Navigation]}
                  className="testimonial-slide-two"
                >
                  {testimonialSliderData &&
                    testimonialSliderData.map((value, i) => (
                      <SwiperSlide key={i}>
                        <div className="testimonial-single-item">
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <ul className="p-0 mb-0 list-unstyled d-flex">
                              {value.rating.map((rating, i) => (
                                <li key={i}>
                                  <i className={rating.iconName}></i>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <p>
                            <q>{value.feedbackText}</q>
                          </p>

                          <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                {/* Quote */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
                                  <path d="M69.9842 21.4492C69.9842 21.4416 69.985 21.434 69.985 21.4264C69.985 12.2235 62.5248 4.76318 53.3218 4.76318C44.1188 4.76318 36.6587 12.2233 36.6587 21.4264C36.6587 30.6295 44.1197 38.0897 53.3219 38.0897C55.2133 38.0897 57.0238 37.76 58.7178 37.1791C54.9689 58.6857 38.1977 72.5552 53.7444 61.1403C70.9834 48.4824 70.0035 21.9348 69.9842 21.4492Z" fill="#FF621F"/>
                                  <path d="M16.6632 38.0895C18.5546 38.0895 20.3651 37.7598 22.0599 37.1789C18.31 58.6855 1.5389 72.5551 17.0857 61.1401C34.3247 48.4824 33.3449 21.9348 33.3255 21.4492C33.3255 21.4416 33.3263 21.434 33.3263 21.4264C33.3263 12.2235 25.8662 4.76318 16.6632 4.76318C7.46014 4.76318 0 12.2233 0 21.4264C0 30.6295 7.46097 38.0895 16.6632 38.0895Z" fill="#FF621F"/>
                                </svg>
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h4>{value.name}</h4>
                                <span>{value.designation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              )}
            </div>

            <div className="col-lg-6">
              <div className="testimonial-img-three mb-4 mb-lg-0 position-relative">
                <Image src={testimonialImg} alt="testimonial" />

                <Image
                  src={mokaup}
                  className="mokup-10 position-absolute top-0 start-0 end-0 w-100"
                  alt="mokup"
                />

                {/* For Shadow */}
                <Image src={shape} className="shape shape-17" alt="shape" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialSliderThree;
