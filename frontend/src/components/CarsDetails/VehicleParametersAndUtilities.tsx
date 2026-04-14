"use client";

import Image from "next/image";

import icon1 from "/public/images/icons/icon34.png";
import icon2 from "/public/images/icons/icon35.png";
import icon3 from "/public/images/icons/icon36.png";
import icon4 from "/public/images/icons/icon37.png";
import icon5 from "/public/images/icons/icon38.png";
import icon6 from "/public/images/icons/icon39.png";
import icon7 from "/public/images/icons/icon40.png";

const VehicleParametersAndUtilities = () => {
  return (
    <>
      <div className="stay-amenities box-style">
        <div className="box-title">
          <h4>Vehicle parameters & utilities</h4>
          <p>Questions are at the heart of making things great.</p>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon1} alt="icon" width="20" height="20" />
              <span className="ms-3">59 MPG Combined, 58 City/60 Hwy</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon2} alt="icon" width="20" height="20" />
              <span className="ms-3">Proximity Key with push button start</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon3} alt="icon" width="20" height="20" />
              <span className="ms-3">139-hp gas/electric combined</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon4} alt="icon" width="20" height="20" />
              <span className="ms-3">
                Smart Cruise Control with Stop & Go (SCC)
              </span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon5} alt="icon" width="20" height="20" />
              <span className="ms-3">
                8-inch color touchscreen display audio
              </span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon6} alt="icon" width="20" height="20" />
              <span className="ms-3">Blind-Spot Collision Warning (BCW)</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={icon7} alt="icon" width="20" height="20" />
              <span className="ms-3">LED Daytime Running Lights (DRL)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleParametersAndUtilities;
