"use client";

import Link from "next/link";
import Image from "next/image";

import heroImg from "/public/images/banner/banner-img-3.jpg";
import bannerImg from "/public/images/banner/banner-img-4.jpg";
import shapeImg from "/public/images/shape/shape-10.png";
import circleImg from "/public/images/text-circle.png";
import BookingSearchForm from "./BookingSearchForm";

const HeroBanner = () => {
  return (
    <>
      <div className="banner-area banner-bg-2 bg-color-fff7ed overflow-hidden">
        <div className="container-fluid mw-1640">
          <div className="banner-content-two">
            <div className="d-xl-flex align-items-center">
              <div className="d-xl-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="banner-img-3 position-relative z-1">
                    {/* heroImg */}
                    <Image 
                      src={heroImg} 
                      alt="banner" 

                      data-aos="fade-up"
                      data-aos-delay="100"
                      data-aos-duration="500"
                      data-aos-once="true"
                    />

                    {/* Shadow shape */}
                    <Image
                      src={shapeImg}
                      className="shape shape-10"
                      alt="shape-10"
                    />
                  </div>
                </div>

                <div className="flex-grow-1">
                  <div 
                    className="banner-content-wrap"
                    data-aos="fade-right"
                    data-aos-delay="100"
                    data-aos-duration="500"
                    data-aos-once="true"
                  >
                    <h1>
                      Find Your Best{" "}
                      <Image
                        src={bannerImg}
                        className="banner-img-4"
                        alt="banner-img-4"
                      />{" "}
                      Smart Real Estate
                    </h1>
                    <p>
                      Proin gravida nibh vel velit auctor aliquet aenean
                      sollicitudin lorem quis bibendum auctor nisi elit
                      consequat ipsum nec sagittis sem nibh id elit dolore
                    </p>
                  </div>
                </div>
              </div>

              <div className="video-play ms-140">
                <Image
                  src={circleImg}
                  className="text-circle"
                  alt="text-circle"
                />
                <Link href="/about-us" className="play-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    viewBox="0 0 34 34"
                    fill="none"
                  >
                    <path
                      d="M22.672 20.6635L10.4788 8.47025L8.47559 10.4734L20.6674 22.6667H9.922V25.5H25.5053V9.91667H22.672V20.6635Z"
                      fill="#10B981"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-5">
             {/* BookingSearchForm */}
              <BookingSearchForm />
            </div>

            {/* Promo Video */}
            <div className="col-lg-7">
              <div 
                className="text-lg-end video-height"
                data-aos="fade-up"
                data-aos-delay="200"
                data-aos-duration="500"
                data-aos-once="true"
              >
                <video autoPlay muted loop playsInline preload="metadata">
                  <source src="/images/banner/video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
