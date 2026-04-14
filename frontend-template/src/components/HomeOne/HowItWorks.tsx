"use client"; 

import Image from "next/image";

import HowItWorksImg1 from "/public/images/works/works-1.jpg";
import HowItWorksImg2 from "/public/images/works/works-2.jpg";
import HowItWorksImg3 from "/public/images/works/works-3.jpg";
import HowItWorksImg4 from "/public/images/works/works-4.jpg";
import shape1 from "/public/images/shape/shape-5.png";

const HowItWorks = () => {
  return (
    <>
      <div className="works-area pt-175 pb-150">
        <div className="container">
          <div 
            className="section-title"
          >
            <span className="top-title">HOW IT WORKS</span>
            <h2>Let’s Find Your Dream Destination Make With Enjoy</h2>
          </div>

          <div className="position-relative z-1">
            <div className="row justify-content-center">
              <div 
                className="col-lg-3 col-sm-6"
              >
                <div className="works-single-item">
                  <div className="works-single-img">
                    <Image src={HowItWorksImg1} alt="works" />
                    <span className="count">01</span>
                  </div>
                  <h4>Book & Relax</h4>
                  <p>
                    Sliquam ses justo sit amet urna uctor sceris quinterdum an
                  </p>
                </div>
              </div>

              <div 
                className="col-lg-3 col-sm-6"
              >
                <div className="works-single-item">
                  <div className="works-single-img">
                    <Image src={HowItWorksImg2} alt="works" />
                    <span className="count">02</span>
                  </div>
                  <h4>Smart Checklist</h4>
                  <p>
                    Sliquam ses justo sit amet urna uctor sceris quinterdum an
                  </p>
                </div>
              </div>

              <div 
                className="col-lg-3 col-sm-6"
              >
                <div className="works-single-item">
                  <div className="works-single-img">
                    <Image src={HowItWorksImg3} alt="works" />
                    <span className="count">03</span>
                  </div>
                  <h4>Reasonable Price</h4>
                  <p>
                    Sliquam ses justo sit amet urna uctor sceris quinterdum an
                  </p>
                </div>
              </div>

              <div 
                className="col-lg-3 col-sm-6"
                
              >
                <div className="works-single-item">
                  <div className="works-single-img">
                    <Image src={HowItWorksImg4} alt="works" />
                    <span className="count">04</span>
                  </div>
                  <h4>Payment Secure</h4>
                  <p>
                    Sliquam ses justo sit amet urna uctor sceris quinterdum an
                  </p>
                </div>
              </div>
            </div>

            {/* Shape Image */}
            <Image
              src={shape1}
              className="shape shape-5"
              alt="shape-5"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
