"use client";

import Image from "next/image";

import placeImg1 from "/public/images/popular/popular-22.jpg";

const Sidebar = () => {
  return (
    <>
      <div className="chackout-sidebar mt-4 mt-xl-0">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <Image src={placeImg1} alt="place" />
          </div>

          <div className="flex-grow-1 ms-4">
            <ul className="ps-0 pe-0 mb-2 list-unstyled d-flex align-items-center">
              <li className="me-1">
                <i
                  className="ri-star-fill"
                  style={{ color: "#FFC107", fontSize: "18px" }}
                ></i>
              </li>
              <li className="me-1">
                <i
                  className="ri-star-fill"
                  style={{ color: "#FFC107", fontSize: "18px" }}
                ></i>
              </li>
              <li className="me-1">
                <i
                  className="ri-star-fill"
                  style={{ color: "#FFC107", fontSize: "18px" }}
                ></i>
              </li>
              <li className="me-1">
                <i
                  className="ri-star-fill"
                  style={{ color: "#FFC107", fontSize: "18px" }}
                ></i>
              </li>
              <li className="me-1">
                <i
                  className="ri-star-fill"
                  style={{ color: "#FFC107", fontSize: "18px" }}
                ></i>
              </li>
            </ul>

            <span>Hotel room in Tokyo,</span>
            <h6>The Lounge & Bar</h6>
            <span>3 beds · 1 baths</span>
          </div>
        </div>

        <h3>Price detail</h3>

        <ul className="ps-0 pe-0 list-unstyled list-order">
          <li className="d-flex align-items-center justify-content-between">
            <span>$19 x 3 day</span>
            <span>$58</span>
          </li>

          <li className="d-flex align-items-center justify-content-between">
            <span>Service charge</span>
            <span>$00</span>
          </li>
        </ul>

        <div className="d-flex justify-content-between total">
          <span>Total</span>
          <span>$58</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
