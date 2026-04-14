"use client"; 

import Image from "next/image";

import aboutImg from "/public/images/about-img.jpg"; 
import mokaup from "/public/images/mokaup/mokup-12.png"; 

const AboutUsContent = () => {
  return (
    <>
      <div className="destination-area pt-175">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-img position-relative z-1">
                <Image src={aboutImg} alt="about" />
                <Image src={mokaup} className="mokup-12 position-absolute top-0 start-0 end-0 w-100 h-100" alt="mokup" />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="destination-content">
                <span className="top-title">WELCOME TO TOFY</span>
                <h2>We Recommend Beautiful Destination every month</h2>
                <p className="mb-33">Lorem ipsum dolor sit amet, consectetur adipiscing elit, do eiusmod tempo incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrice risus commodo viverra maecenas accumsan lacus vel facilisis.</p>

                <ul className="p-0 list-unstyled destination-content-list mb-0">
                  <li>
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <span className="count">01</span>
                      </div>
                      <div className="flex-grow-1 ms-35">
                        <h4>Quality Services Ensure</h4>
                        <p>Rhoncus dolor quam etiam mattis tincidunt nec lobortis sociis aenean netus tempor duis labore magna setom</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <span className="count">02</span>
                      </div>
                      <div className="flex-grow-1 ms-35">
                        <h4>Customer Care</h4>
                        <p>Rhoncus dolor quam etiam mattis tincidunt nec lobortis sociis aenean netus tempor duis labore magna setom</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUsContent;
