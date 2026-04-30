"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import Image from "next/image";

import author from "/public/images/author/author-15.jpg";
import author2 from "/public/images/author/author-16.jpg";
import Stays from "./Stays";
import Experiences from "./Experiences";
import CarForRent from "./CarForRent";
import Link from "next/link";
import {usePathname} from "next/navigation";

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
    const currentRoute = usePathname();

    const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <>

        <div className="container pt-5 pb-5">
            <div className="row">
                <div className="col-xl-8 col-xxl-9">
                    <ul className="nav nav-tabs most-popular-tab">
                        <li className="nav-item" role="presentation">
                            <button>
                                <Link
                                    href="/dashboard/bookings"
                                    className={`dropdown-item ${
                                        currentRoute === "/stay/bookings" ? "active" : ""
                                    }`}
                                >Your Bookings</Link>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button>
                                <Link
                                    href="/dashboard/listings"
                                    className={`dropdown-item ${
                                        currentRoute === "/stay/listings" ? "active" : ""
                                    }`}
                                >Your Listings</Link>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button>
                                <Link
                                    href="/dashboard/listings/bookings/"
                                    className={`dropdown-item ${
                                        currentRoute === "/dashboard/listings/bookings/" ? "active" : ""
                                    }`}
                                >Management</Link>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button>
                                <Link
                                    href="/account/"
                                    className={`dropdown-item ${
                                        currentRoute === "/account/" ? "active" : ""
                                    }`}
                                >Account</Link>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button>
                                <Link
                                href="/payments/"
                                className={`dropdown-item ${
                                    currentRoute === "/payments/" ? "active" : ""
                                }`}
                            >Payments</Link>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

      <div className="author-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-xxl-9">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>{userName}&apos;s Dashboard</h2>
                  <p>
                      {userName}&apos;s bookings based on the most recent
                  </p>
                </div>

                <ul className="nav nav-tabs most-popular-tab">
                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === 0 ? "active" : ""}
                      onClick={() => handleTabClick(0)}
                    >
                      Hotel Bookings
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

export default DashboardContent;
