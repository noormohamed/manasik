"use client";

import Image from "next/image";

import authorImg from "/public/images/author/author-19.jpg";

const Sidebar = () => {
  return (
    <>
      <div className="stay-details-sidebar">
        <div className="stay-single-sidebar-item">
          <div className="per-person">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4>
                $150 <span>/ Per Person</span>
              </h4>

              <div className="d-flex align-items-center">
                <i
                  className="ri-star-fill"
                  style={{
                    color: "#FFC107",
                    fontSize: "18px",
                    marginLeft: "3px",
                  }}
                ></i>
                <i
                  className="ri-star-fill"
                  style={{
                    color: "#FFC107",
                    fontSize: "18px",
                    marginLeft: "3px",
                  }}
                ></i>
                <i
                  className="ri-star-fill"
                  style={{
                    color: "#FFC107",
                    fontSize: "18px",
                    marginLeft: "3px",
                  }}
                ></i>
                <i
                  className="ri-star-fill"
                  style={{
                    color: "#FFC107",
                    fontSize: "18px",
                    marginLeft: "3px",
                  }}
                ></i>
                <i
                  className="ri-star-fill"
                  style={{
                    color: "#FFC107",
                    fontSize: "18px",
                    marginLeft: "3px",
                  }}
                ></i>
              </div>
            </div>

            <div className="booking-date">
              <div className="d-flex align-items-center p-30 divider">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M15.8337 2.70829H15.6253V1.66663C15.6253 1.32496 15.342 1.04163 15.0003 1.04163C14.6587 1.04163 14.3753 1.32496 14.3753 1.66663V2.70829H10.6253V1.66663C10.6253 1.32496 10.342 1.04163 10.0003 1.04163C9.65866 1.04163 9.37533 1.32496 9.37533 1.66663V2.70829H5.62533V1.66663C5.62533 1.32496 5.34199 1.04163 5.00033 1.04163C4.65866 1.04163 4.37533 1.32496 4.37533 1.66663V2.70829H4.16699C2.44199 2.70829 1.04199 4.10829 1.04199 5.83329V15.8333C1.04199 17.5583 2.44199 18.9583 4.16699 18.9583H15.8337C17.5587 18.9583 18.9587 17.5583 18.9587 15.8333V5.83329C18.9587 4.10829 17.5587 2.70829 15.8337 2.70829ZM4.16699 3.95829H4.37533V4.99996C4.37533 5.34163 4.65866 5.62496 5.00033 5.62496C5.34199 5.62496 5.62533 5.34163 5.62533 4.99996V3.95829H9.37533V4.99996C9.37533 5.34163 9.65866 5.62496 10.0003 5.62496C10.342 5.62496 10.6253 5.34163 10.6253 4.99996V3.95829H14.3753V4.99996C14.3753 5.34163 14.6587 5.62496 15.0003 5.62496C15.342 5.62496 15.6253 5.34163 15.6253 4.99996V3.95829H15.8337C16.867 3.95829 17.7087 4.79996 17.7087 5.83329V7.70829H2.29199V5.83329C2.29199 4.79996 3.13366 3.95829 4.16699 3.95829ZM15.8337 17.7083H4.16699C3.13366 17.7083 2.29199 16.8666 2.29199 15.8333V8.95829H17.7087V15.8333C17.7087 16.8666 16.867 17.7083 15.8337 17.7083Z"
                    fill="#10B981"
                  />
                </svg>

                <div className="ms-3">
                  <h4>Booking Date</h4>
                  <input type="date" className="border-0" />
                </div>
              </div>
              <div className="d-flex align-items-center p-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <g clipPath="url(#clip0_3728_402)">
                    <path
                      d="M0.774414 18.3334C0.774414 18.7936 1.14714 19.1667 1.60775 19.1667C2.06836 19.1667 2.44108 18.7936 2.44108 18.3334C2.44108 15.3927 4.13399 12.7893 6.7728 11.5582C7.68604 12.1516 8.77246 12.5 9.94027 12.5C11.1125 12.5 12.2031 12.1493 13.1185 11.5517C13.9062 11.9235 14.6363 12.4238 15.2438 13.031C16.6606 14.4483 17.4411 16.3314 17.4411 18.3334C17.4411 18.7936 17.8138 19.1667 18.2744 19.1667C18.735 19.1667 19.1077 18.7936 19.1077 18.3334C19.1077 15.8863 18.154 13.5848 16.4222 11.8527C15.8427 11.2729 15.1693 10.7757 14.4467 10.3659C15.2752 9.35846 15.7736 8.0698 15.7736 6.66671C15.7736 3.45015 13.1564 0.833374 9.94027 0.833374C6.72412 0.833374 4.10693 3.45015 4.10693 6.66671C4.10693 8.0664 4.6033 9.3519 5.42814 10.3583C2.56747 11.9689 0.774414 14.9782 0.774414 18.3334ZM9.94027 2.50004C12.2376 2.50004 14.1069 4.36934 14.1069 6.66671C14.1069 8.96407 12.2376 10.8334 9.94027 10.8334C7.6429 10.8334 5.7736 8.96407 5.7736 6.66671C5.7736 4.36934 7.6429 2.50004 9.94027 2.50004Z"
                      fill="#10B981"
                    />
                  </g>
                </svg>

                <div className="ms-3">
                  <h4>Guest</h4>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                  >
                    <option defaultValue="0">08</option>
                    <option defaultValue="1">09</option>
                    <option defaultValue="2">10</option>
                    <option defaultValue="3">15</option>
                  </select>
                </div>
              </div>
            </div>

            <ul className="ps-0 pe-0 pe-0 list-unstyled fe-list">
              <li className="d-flex align-items-center justify-content-between">
                <span>$119 x 3 night</span>
                <span>$357</span>
              </li>

              <li className="d-flex align-items-center justify-content-between">
                <span>Service charge</span>
                <span>$0</span>
              </li>
            </ul>

            <div className="d-flex justify-content-between align-items-center total">
              <span>Total</span>
              <span>$199</span>
            </div>

            <button
              type="submit"
              className="default-btn active w-100 d-block border-0"
            >
              Reserve
            </button>
          </div>
        </div>

        <div className="stay-single-sidebar-item">
          <div className="pick-up">
            <h5>Pick up and drop off</h5>
            <ul className="p-0 mb-0 list-unstyled">
              <li>
                <div className="d-flex align-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <circle
                      cx="15"
                      cy="15"
                      r="14.5"
                      stroke="#111827"
                      strokeOpacity="0.2"
                    />
                  </svg>
                  <div className="ms-3">
                    <span>Monday, August 12 · 10:00</span>
                    <p>Saint Petersburg City Center</p>
                  </div>
                </div>
              </li>
              <li>
                <div className="d-flex align-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <circle
                      cx="15"
                      cy="15"
                      r="14.5"
                      stroke="#111827"
                      strokeOpacity="0.2"
                    />
                  </svg>
                  <div className="ms-3">
                    <span>Monday, August 12 · 10:00</span>
                    <p>Saint Petersburg City Center</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
