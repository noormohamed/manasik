"use client";

import React, { useState } from "react";

import Image from "next/image";

import author from "/public/images/author/author-15.jpg";
import author2 from "/public/images/author/author-16.jpg";
import Stays from "./Stays";
import Experiences from "./Experiences";
import CarForRent from "./CarForRent";
import AuthorSidebar from "./AuthorSidebar";

const AuthorContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="author-area ptb-175">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-xxl-9">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>Malatan Ibrahim&apos;s listings</h2>
                  <p>
                    Malatan Ibrahim&apos;s listings is very rich, 5 star reviews
                    help him to be more branded.
                  </p>
                </div>

                <ul className="nav nav-tabs most-popular-tab">
                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === 0 ? "active" : ""}
                      onClick={() => handleTabClick(0)}
                    >
                      Stays
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === 1 ? "active" : ""}
                      onClick={() => handleTabClick(1)}
                    >
                      Experiences
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === 2 ? "active" : ""}
                      onClick={() => handleTabClick(2)}
                    >
                      Car For Rent
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {activeTab === 0 && (
                    <div>
                      {/* Stays */}
                      <Stays />
                    </div>
                  )}
                  {activeTab === 1 && (
                    <div>
                      {/* Experiences */}
                      <Experiences />
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div>
                      {/* CarForRent */}
                      <CarForRent />
                    </div>
                  )}
                </div>
              </div>

              <div className="author-content-review">
                <h4>2 Reviews</h4>

                <ul className="p-0 mb-0 list-unstyled review-list">
                  <li>
                    <div className="d-sm-flex">
                      <div className="flex-shrink-0">
                        <Image
                          src={author}
                          className="rounded-circle"
                          alt="author-15"
                        />
                      </div>
                      <div className="flex-grow-1 ms-4">
                        <div className="d-sm-flex align-items-center justify-content-between">
                          <div className="">
                            <h6>Monir Abraham</h6>
                            <div className="d-flex date-time">
                              <span>Aug 20,2023</span>
                              <span>07:10 pm</span>
                            </div>
                          </div>
                          <div className="sreview">
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
                        <p>
                          Lorem ipsum dolor sit amet consetetur sadipscing elitr
                          sed diam nonum magna dolore invidunt ut labore et
                          dolore magna aliquyam erat dolore ipsum sadmo
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="d-sm-flex">
                      <div className="flex-shrink-0">
                        <Image
                          src={author2}
                          className="rounded-circle"
                          alt="author-16"
                        />
                      </div>
                      <div className="flex-grow-1 ms-4">
                        <div className="d-sm-flex align-items-center justify-content-between">
                          <div className="">
                            <h6>Harris Joshef</h6>
                            <div className="d-flex date-time">
                              <span>Aug 21,2023</span>
                              <span>09:15 pm</span>
                            </div>
                          </div>
                          <div className="sreview">
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
                        <p>
                          Lorem ipsum dolor sit amet consetetur sadipscing elitr
                          sed diam nonum magna dolore invidunt ut labore et
                          dolore magna aliquyam erat dolore ipsum sadmo
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-xl-4 col-xxl-3">
              {/* AuthorSidebar */}
              <AuthorSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorContent;
