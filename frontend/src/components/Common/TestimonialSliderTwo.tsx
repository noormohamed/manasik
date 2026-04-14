"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";

import testimonialImg from "/public/images/testimonial-img-2.jpg";
import mokaup from "/public/images/mokaup/mokup-6.png";
import shape from "/public/images/shape/shape-12.png";

const testimonialSliderData = [
  {
    id: "1",
    name: "Lonathon Benjamin",
    designation: "Happy Traveler",
    feedbackText:
      "Proin gravida nib velit auctort aenean lorem quis bibendu nis conseq kpsum nec sagittis sem nibh id elit uis sed odio sit cursus molore lorem ipsum dolor sit amet consectetur adipisc elit sed eiuod door tem dolo.",
    feedbackTitle: "Most Attractive Packages!",
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
    feedbackTitle: "Most Attractive Packages!",
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

const TestimonialSliderTwo: React.FC = () => {
  return (
    <>
      <div className="testimonial-area ptb-175">
        <div className="container">
          <div className="section-title">
            <span className="top-title">TESTIMONIAL</span>
            <h2>What Our Users Say About Us</h2>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="testimonial-img mb-4 mb-lg-0 position-relative">
                <Image src={testimonialImg} alt="testimonial" />

                <Image
                  src={mokaup}
                  className="mokup-3 position-absolute top-0 start-0 end-0 w-100"
                  alt="mokup-3"
                />

                {/* For Shadow */}
                <Image src={shape} className="shape shape-7" alt="shape-7" />
              </div>
            </div>

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
                          <div className="d-md-flex align-items-center justify-content-between mb-4">
                            <h3>{value.feedbackTitle}</h3>

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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="70"
                                  height="70"
                                  viewBox="0 0 70 70"
                                  fill="none"
                                >
                                  <path
                                    d="M28.4103 9.84375H2.05078C0.918045 9.84375 0 10.7618 0 11.8945V38.254C0 39.3867 0.918045 40.3048 2.05078 40.3048H13.1795V58.0238C13.1795 59.156 14.0975 60.0745 15.2303 60.0745H21.8205C22.7033 60.0745 23.4868 59.5095 23.7656 58.6721L30.3553 38.9024C30.4253 38.6935 30.461 38.4746 30.461 38.254V11.8945C30.461 10.7618 29.543 9.84375 28.4103 9.84375Z"
                                    fill="#10B981"
                                  />
                                  <path
                                    d="M67.9493 9.84375H41.5898C40.4571 9.84375 39.5391 10.7618 39.5391 11.8945V38.254C39.5391 39.3867 40.4571 40.3048 41.5898 40.3048H52.7191V58.0238C52.7191 59.156 53.6371 60.0745 54.7699 60.0745H61.3596C62.2424 60.0745 63.0258 59.5095 63.3052 58.6721L69.8949 38.9024C69.9643 38.6935 70.0001 38.4746 70.0001 38.254V11.8945C70.0001 10.7618 69.0821 9.84375 67.9493 9.84375Z"
                                    fill="#10B981"
                                  />
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
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialSliderTwo;
