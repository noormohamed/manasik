"use client";

import Image from "next/image";
import Link from "next/link";

import welcomeImg from "/public/images/destination-img.jpg";
import mokaup from "/public/images/mokaup/mokup-8.png";
import shape from "/public/images/shape/shape-15.png";

const Welcome = () => {
  return (
    <>
      <div className="destination-area pb-175 pt-175 overflow-hidden">
        <div className="container">
          <div className="row align-items-center">
            <div 
              className="col-lg-6" 
            >
              <div className="destination-content">
                <span className="top-title">WELCOME TO TOFY</span>
                <h2>We Recommend Beautiful Destination every month</h2>
                <p className="mb-33">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, do
                  eiusmod tempo incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrice risus commodo viverra maecenas
                  accumsan lacus vel facilisis.
                </p>

                <ul className="p-0 list-unstyled destination-content-list">
                  <li>
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <span className="count">01</span>
                      </div>
                      <div className="flex-grow-1 ms-35">
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
                        <span className="count">02</span>
                      </div>
                      <div className="flex-grow-1 ms-35">
                        <h4>Customer Care</h4>
                        <p>
                          Rhoncus dolor quam etiam mattis tincidunt nec lobortis
                          sociis aenean netus tempor duis labore magna setom
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>

                <div className="destination-content-btn">
                  <Link href="/stay" className="default-btn active">
                    Browse More
                  </Link>
                  <Link
                    href="/subscription"
                    className="default-btn text-dark bg-transparent"
                  >
                    <span>Get A Free Quote</span>
                  </Link>
                </div>
              </div>
            </div>

            <div 
              className="col-lg-6" 
            >
              <div className="destination-img position-relative z-1">
                <Image src={welcomeImg} alt="destination" style={{borderRadius: "20px"}} />
                <Image src={shape} className="shape shape-15" alt="shape-15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
