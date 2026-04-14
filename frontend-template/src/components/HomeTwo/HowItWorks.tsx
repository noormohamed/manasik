"use client";

import Image from "next/image";

import howItWorkImg from "/public/images/how-it-works-img.jpg";
import mokaup from "/public/images/mokaup/mokup-4.png";
import shape from "/public/images/shape/shape-3.png";

import icon1 from "/public/images/icons/icon4.png";
import icon2 from "/public/images/icons/icon5.png";
import icon3 from "/public/images/icons/icon6.png";
import icon4 from "/public/images/icons/icon7.png";

const HowItWorks = () => {
  return (
    <>
      <div className="how-it-works-area bg-color-f3f4f6 pt-175 pb-150">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4">
              <div className="how-it-works-content">
                <span className="top-title">HOW IT WORKS</span>
                <h2>The Service You Get From Tofy</h2>
                <p>
                  Lorem ipsum dolor sit amet consect adiscing sed do eiusmod
                  tempor incididunt labore et dolore magna aliqua adipiscing
                  elit
                </p>
                <div className="how-it-works-img position-relative z-1">
                  <Image src={howItWorkImg} alt="how-it-works-img" />

                  <Image
                    src={mokaup}
                    className="mokup-4 position-absolute top-0 start-0 w-100"
                    alt="mokup-4"
                  />

                  <Image src={shape} className="shape shape-3" alt="shape" />
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row justify-content-center">
                <div 
                  className="col-lg-6 col-md-6"
                >
                  <div className="how-it-works-single-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="how-it-works-single-icon">
                        <Image src={icon1} alt="icon" />
                      </div>
                      <h1>01</h1>
                    </div>
                    <h3>Exclusive Trip</h3>
                    <p>
                      Lorem ipsum dolor amet coectetur sed do eiusmod tempor
                      incididunt labore magna aliqua enim ad minim magna
                    </p>
                  </div>
                </div>

                <div 
                  className="col-lg-6 col-md-6"
                >
                  <div className="how-it-works-single-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="how-it-works-single-icon">
                        <Image src={icon2} alt="icon" />
                      </div>
                      <h1>02</h1>
                    </div>
                    <h3>Lots Of Choices</h3>
                    <p>
                      Lorem ipsum dolor amet coectetur sed do eiusmod tempor
                      incididunt labore magna aliqua enim ad minim magna
                    </p>
                  </div>
                </div>

                <div 
                  className="col-lg-6 col-md-6"
                >
                  <div className="how-it-works-single-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="how-it-works-single-icon">
                        <Image src={icon3} alt="icon" />
                      </div>
                      <h1>03</h1>
                    </div>
                    <h3>Professional Guide</h3>
                    <p>
                      Lorem ipsum dolor amet coectetur sed do eiusmod tempor
                      incididunt labore magna aliqua enim ad minim magna
                    </p>
                  </div>
                </div>

                <div 
                  className="col-lg-6 col-md-6"
                >
                  <div className="how-it-works-single-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="how-it-works-single-icon">
                        <Image src={icon4} alt="icon" />
                      </div>
                      <h1>04</h1>
                    </div>
                    <h3>Secure & Simple</h3>
                    <p>
                      Lorem ipsum dolor amet coectetur sed do eiusmod tempor
                      incididunt labore magna aliqua enim ad minim magna
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
