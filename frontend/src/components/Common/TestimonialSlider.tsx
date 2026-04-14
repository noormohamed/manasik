"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import testimonialImg from "/public/images/testimonial-img.png";
import mokaup from "/public/images/mokaup/mokup-3.png";
import shape from "/public/images/shape/shape-7.png";

const testimonialSliderData = [
  {
    id: "1",
    image: "/images/testimonials/testimonial-1.jpg",
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
    image: "/images/testimonials/testimonial-2.jpg",
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

const TestimonialSlider: React.FC = () => {
  return (
    <>
      <div className="testimonial-area pb-175">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="testimonial-img mb-4 mb-lg-0 position-relative">
                <Image src={testimonialImg} alt="testimonial" style={{borderRadius: "20px"}} />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="testimonial-content">
                <span className="top-title">TESTIMONIAL</span>
                <h2>What Our Customer Say Us</h2>

                {testimonialSliderData && (
                  <Swiper
                    spaceBetween={30}
                    pagination={{
                      dynamicBullets: true,
                      clickable: true,
                    }}
                    autoplay={{
                      delay: 5000,
                      pauseOnMouseEnter: true,
                      disableOnInteraction: true,
                    }}
                    modules={[Autoplay, Pagination]}
                    className="testimonial-slide"
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
                                  <Image
                                    src={value.image}
                                    className="rounded-circle"
                                    alt={value.name}
                                    width={65}
                                    height={65}
                                  />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h4>{value.name}</h4>
                                  <span>{value.designation}</span>
                                </div>
                              </div>

                              {/* Quote */}
                              <svg
                                className="d-none d-sm-block"
                                xmlns="http://www.w3.org/2000/svg"
                                width="66"
                                height="66"
                                viewBox="0 0 66 66"
                                fill="none"
                              >
                                <path
                                  d="M22.8466 5.07715H7.61552C5.49985 5.07715 3.7019 5.81761 2.22083 7.29812C0.740463 8.77891 0 10.5769 0 12.6927V27.9231C0 30.0388 0.740046 31.8365 2.22083 33.317C3.70176 34.7974 5.50027 35.5381 7.61552 35.5381H16.5001C17.5575 35.5381 18.4567 35.9085 19.1972 36.6487C19.9376 37.3884 20.3077 38.288 20.3077 39.3461V40.6147C20.3077 43.4177 19.3159 45.81 17.333 47.7935C15.3498 49.7761 12.957 50.7678 10.1537 50.7678H7.61552C6.92757 50.7678 6.33284 51.0196 5.83021 51.5217C5.328 52.0238 5.07669 52.6189 5.07669 53.3064V58.384C5.07669 59.0704 5.328 59.6667 5.83021 60.1689C6.33325 60.6708 6.92743 60.9228 7.61552 60.9228H10.1538C12.9041 60.9228 15.5285 60.3866 18.0274 59.316C20.5263 58.2453 22.6878 56.7972 24.5124 54.9726C26.3366 53.1478 27.7845 50.9867 28.8553 48.4877C29.926 45.9889 30.4615 43.3647 30.4615 40.6148V12.6921C30.4615 10.5763 29.7211 8.77849 28.2405 7.29798C26.76 5.81747 24.9617 5.07715 22.8466 5.07715Z"
                                  fill="#FF621F"
                                />
                                <path
                                  d="M63.7784 7.29812C62.298 5.81761 60.4999 5.07715 58.3842 5.07715H43.1537C41.0381 5.07715 39.2401 5.81761 37.7596 7.29812C36.2792 8.77905 35.5391 10.5769 35.5391 12.6927V27.9231C35.5391 30.0388 36.2792 31.8365 37.7596 33.317C39.2401 34.7974 41.0382 35.5381 43.1537 35.5381H52.0383C53.0957 35.5381 53.9956 35.9085 54.736 36.6487C55.4756 37.3889 55.8465 38.288 55.8465 39.3461V40.6147C55.8465 43.4177 54.8547 45.81 52.8713 47.7935C50.8883 49.7761 48.4961 50.7678 45.6924 50.7678H43.1537C42.4664 50.7678 41.8711 51.0196 41.369 51.5217C40.8665 52.0238 40.6149 52.6189 40.6149 53.3064V58.384C40.6149 59.0704 40.8665 59.6667 41.369 60.1689C41.8709 60.6708 42.4662 60.9228 43.1537 60.9228H45.6924C48.4423 60.9228 51.0666 60.3866 53.5658 59.316C56.0642 58.2453 58.2254 56.7972 60.0502 54.9726C61.8748 53.1478 63.3235 50.9861 64.3937 48.4877C65.4642 45.9895 66 43.3647 66 40.6148V12.6921C65.9996 10.5763 65.2598 8.77849 63.7784 7.29812Z"
                                  fill="#FF621F"
                                />
                              </svg>
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
      </div>
    </>
  );
};

export default TestimonialSlider;
