"use client";

import Image from "next/image";

import icon1 from "/public/images/icons/icon8.png";
import icon2 from "/public/images/icons/icon9.png";

import whyChooseImg from "/public/images/why-choose-tofy-img.jpg";
import mokaup from "/public/images/mokaup/mokup-5.png";
import shape from "/public/images/shape/shape-11.png";

const WhyChooseUs = () => {
  return (
    <>
      <div className="why-choose-tofy-area pt-175">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div 
                className="why-choose-tofy-content"
              >
                <span className="top-title">WHY CHOOSE TOFY</span>
                <h2>We Recommend Beautiful Destination every month</h2>
                <p className="mb-40">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, do
                  eiusmod tempo incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrice risus commodo viverra maecenas
                  accumsan lacus vel facilisis.
                </p>

                <ul className="p-0 mb-0 list-unstyled">
                  <li>
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <Image src={icon1} alt="icon" />
                      </div>
                      <div className="flex-grow-1 ms-30">
                        <h4>Quality Services Ensure</h4>
                        <p>
                          Rhoncus dolor quam etiam mattis tincidunt nec lobortis
                          sociis aenean netus tempor duis labore magna setom
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <Image src={icon2} alt="icon" />
                      </div>
                      <div className="flex-grow-1 ms-30">
                        <h4>Customer Care</h4>
                        <p>
                          Rhoncus dolor quam etiam mattis tincidunt nec lobortis
                          sociis aenean netus tempor duis labore magna setom
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div 
                className="why-choose-tofy-img position-relative"
              >
                <Image src={whyChooseImg} alt="Why Choose" />

                <Image
                  src={mokaup}
                  className="mokup-5 position-absolute top-0 start-0 w-100"
                  alt="mokup-5"
                />

                <Image src={shape} className="shape shape-11" alt="shape" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhyChooseUs;
