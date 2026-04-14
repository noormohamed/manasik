"use client";

import Link from "next/link";

const SetHouseRulesForYourGuests = () => {
  return (
    <>
      <div className="choosing-listing-categories-area ptb-175">
        <div className="container">
          <div className="choosing-listing-categories-content">
            <form className="choosing-form amenities">
              <div className="border-style">
                <h4>Set house rules for your guests</h4>
                <p>Guests must agree to your house rules before they book.</p>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">General amenities</span>
                  </div>
                </div>
 
                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="generalDoNotAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="generalDoNotAllow"
                      >
                        Do not allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="generalAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="generalAllow"
                      >
                        Allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="generalCharge"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="generalCharge"
                      >
                        Charge
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Pet</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="petDoNotAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="petDoNotAllow"
                      >
                        Do not allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="petAllow"
                      />
                      <label className="form-check-label" htmlFor="petAllow">
                        Allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="petCharge"
                      />
                      <label className="form-check-label" htmlFor="petCharge">
                        Charge
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Party organizing</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="partyDoNotAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="partyDoNotAllow"
                      >
                        Do not allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="partyAllow"
                      />
                      <label className="form-check-label" htmlFor="partyAllow">
                        Allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="partyCharge"
                      />
                      <label className="form-check-label" htmlFor="partyCharge">
                        Charge
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <span className="title">Cooking</span>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="cookingDoNotAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="cookingDoNotAllow"
                      >
                        Do not allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="cookingAllow"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="cookingAllow"
                      >
                        Allow
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox" 
                        id="cookingCharge"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="cookingCharge"
                      >
                        Charge
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="additional-rules">
                <h5>Additional rules</h5>
                <ul className="ps-0 pe-0 list-unstyled additional-list">
                  <li className="d-flex align-items-center justify-content-between">
                    <span>No smoking in common areas</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_3756_5634)">
                        <path
                          d="M10.665 5.33337C10.54 5.20839 10.3704 5.13818 10.1937 5.13818C10.0169 5.13818 9.84736 5.20839 9.72234 5.33337L7.99834 7.05737L6.27434 5.33337C6.1486 5.21194 5.9802 5.14474 5.80541 5.14626C5.63061 5.14778 5.4634 5.21789 5.33979 5.3415C5.21619 5.4651 5.14608 5.63231 5.14456 5.80711C5.14304 5.98191 5.21023 6.15031 5.33167 6.27604L7.05567 8.00004L5.33167 9.72404C5.21023 9.84978 5.14304 10.0182 5.14456 10.193C5.14608 10.3678 5.21619 10.535 5.33979 10.6586C5.4634 10.7822 5.63061 10.8523 5.80541 10.8538C5.9802 10.8553 6.1486 10.7881 6.27434 10.6667L7.99834 8.94271L9.72234 10.6667C9.84807 10.7881 10.0165 10.8553 10.1913 10.8538C10.3661 10.8523 10.5333 10.7822 10.6569 10.6586C10.7805 10.535 10.8506 10.3678 10.8521 10.193C10.8536 10.0182 10.7864 9.84978 10.665 9.72404L8.94101 8.00004L10.665 6.27604C10.79 6.15102 10.8602 5.98148 10.8602 5.80471C10.8602 5.62793 10.79 5.45839 10.665 5.33337Z"
                          fill="#555555"
                        />
                        <path
                          d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                          fill="#555555"
                        />
                      </g>
                    </svg>
                  </li>

                  <li className="d-flex align-items-center justify-content-between">
                    <span>Do not wear shoes/shoes in the house</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_3756_5634)">
                        <path
                          d="M10.665 5.33337C10.54 5.20839 10.3704 5.13818 10.1937 5.13818C10.0169 5.13818 9.84736 5.20839 9.72234 5.33337L7.99834 7.05737L6.27434 5.33337C6.1486 5.21194 5.9802 5.14474 5.80541 5.14626C5.63061 5.14778 5.4634 5.21789 5.33979 5.3415C5.21619 5.4651 5.14608 5.63231 5.14456 5.80711C5.14304 5.98191 5.21023 6.15031 5.33167 6.27604L7.05567 8.00004L5.33167 9.72404C5.21023 9.84978 5.14304 10.0182 5.14456 10.193C5.14608 10.3678 5.21619 10.535 5.33979 10.6586C5.4634 10.7822 5.63061 10.8523 5.80541 10.8538C5.9802 10.8553 6.1486 10.7881 6.27434 10.6667L7.99834 8.94271L9.72234 10.6667C9.84807 10.7881 10.0165 10.8553 10.1913 10.8538C10.3661 10.8523 10.5333 10.7822 10.6569 10.6586C10.7805 10.535 10.8506 10.3678 10.8521 10.193C10.8536 10.0182 10.7864 9.84978 10.665 9.72404L8.94101 8.00004L10.665 6.27604C10.79 6.15102 10.8602 5.98148 10.8602 5.80471C10.8602 5.62793 10.79 5.45839 10.665 5.33337Z"
                          fill="#555555"
                        />
                        <path
                          d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                          fill="#555555"
                        />
                      </g>
                    </svg>
                  </li>

                  <li className="d-flex align-items-center justify-content-between">
                    <span>No cooking in the bedroom</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_3756_5634)">
                        <path
                          d="M10.665 5.33337C10.54 5.20839 10.3704 5.13818 10.1937 5.13818C10.0169 5.13818 9.84736 5.20839 9.72234 5.33337L7.99834 7.05737L6.27434 5.33337C6.1486 5.21194 5.9802 5.14474 5.80541 5.14626C5.63061 5.14778 5.4634 5.21789 5.33979 5.3415C5.21619 5.4651 5.14608 5.63231 5.14456 5.80711C5.14304 5.98191 5.21023 6.15031 5.33167 6.27604L7.05567 8.00004L5.33167 9.72404C5.21023 9.84978 5.14304 10.0182 5.14456 10.193C5.14608 10.3678 5.21619 10.535 5.33979 10.6586C5.4634 10.7822 5.63061 10.8523 5.80541 10.8538C5.9802 10.8553 6.1486 10.7881 6.27434 10.6667L7.99834 8.94271L9.72234 10.6667C9.84807 10.7881 10.0165 10.8553 10.1913 10.8538C10.3661 10.8523 10.5333 10.7822 10.6569 10.6586C10.7805 10.535 10.8506 10.3678 10.8521 10.193C10.8536 10.0182 10.7864 9.84978 10.665 9.72404L8.94101 8.00004L10.665 6.27604C10.79 6.15102 10.8602 5.98148 10.8602 5.80471C10.8602 5.62793 10.79 5.45839 10.665 5.33337Z"
                          fill="#555555"
                        />
                        <path
                          d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                          fill="#555555"
                        />
                      </g>
                    </svg>
                  </li>
                </ul>

                <div className="row">
                  <div className="col-lg-9">
                    <label htmlFor="tag" className="visually-hidden">
                      Password
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="tag"
                      placeholder="No smoking..."
                      style={{ height: "56px" }}
                    />
                  </div>
                  <div className="col-lg-3">
                    <button
                      type="submit"
                      className="default-btn active rounded-10 w-100 d-block border-0"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="choosing-btn">
              <Link
                href="/add-listing/four"
                className="default-btn white-btn rounded-10"
              >
                Go Back
              </Link>
              <Link
                href="/add-listing/six"
                className="default-btn active rounded-10"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetHouseRulesForYourGuests;
