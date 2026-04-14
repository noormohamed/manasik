"use client";

import Image from "next/image";

import checkCircleIcon from "/public/images/icons/check-circle.png"; 

const Include = () => {
  return (
    <>
      <div className="stay-amenities box-style">
        <div className="box-title">
          <h4>Include</h4>
          <p>Included in the price</p>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Free cancellation up to 48 hours</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Unlimited mileage</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Theft Protection with $19,999 excess</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Masks are required at the pick-up location</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Car interiors and exteriors cleaned with</span>
            </div>
          </div> 
        </div>
      </div>
    </>
  );
};

export default Include;
