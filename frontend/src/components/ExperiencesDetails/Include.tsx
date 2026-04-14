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
              <span className="ms-3">Set Menu Lunch on boat</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Express Bus From Hanoi To and Return</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Mineral Water On Express Bus</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Kayak or Bamboo Boat. Life Jacket.</span>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-25">
              <Image src={checkCircleIcon} alt="icon" width="20" height="20" />
              <span className="ms-3">Halong Bay Entrance Ticket</span>
            </div>
          </div> 
        </div>
      </div>
    </>
  );
};

export default Include;
