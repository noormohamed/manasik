"use client";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import FilterHeader from "./FilterHeader";
import Image from "next/image";

import airlinesLogo1 from "/public/images/airlines-logo1.png";
import airlinesLogo2 from "/public/images/airlines-logo2.png";
import airlinesLogo3 from "/public/images/airlines-logo3.png";
import airlinesLogo4 from "/public/images/airlines-logo4.png";
import airlinesLogo5 from "/public/images/airlines-logo5.png";
import airlinesLogo6 from "/public/images/airlines-logo6.png";

const FlightList = () => {
  return (
    <>
      <div className="flight-area ptb-175">
        <div className="container">
          {/* FilterHeader */}
          <FilterHeader />

          <div className="bg-color-fff7ed flight-accordion">
            <Accordion preExpanded={['a']}>
              <AccordionItem uuid="a">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo1}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$4,100</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo1}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business className · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo1}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>

              <AccordionItem uuid="b">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo2}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$6,100</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo2}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo2}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>

              <AccordionItem uuid="c">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo3}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>

                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$3,400</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo3}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo3}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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
                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>

              <AccordionItem uuid="d">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo4}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$5,700</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo4}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo4}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>

              <AccordionItem uuid="e">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo5}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$1,300</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo5}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo5}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>

              <AccordionItem uuid="f">
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo6}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <div className="ms-70">
                          <span className="title d-block">11:00 - 2:00</span>
                          <span className="sub-title d-block">Canada Air</span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">HND - SIN</span>
                          <span className="sub-title d-block">
                            10 hours 20 minutes
                          </span>
                        </div>
                        <div className="ms-70">
                          <span className="title d-block">1 Stop</span>
                          <span className="sub-title d-block">
                            2 hours 15 minutes BKK
                          </span>
                        </div>
                      </div>

                      <div className="pe-70 time">
                        <span className="title d-block">$2,400</span>
                        <span className="sub-title d-block">Round-trip</span>
                      </div>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo6}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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

                    <div className="col-lg-6">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-bottom py-4 my-4 bangkok">
                    <p>Transit time: 15 hours 45 minutes - Bangkok (BKK)</p>
                  </div>

                  <div className="row">
                    <div className="col-lg-6">
                      <div className="d-flex align-items-center">
                        <Image
                          src={airlinesLogo6}
                          alt="airlines"
                          width={50}
                          height={50}
                          className="rounded-circle"
                        />

                        <ul className="p-0 mb-0 list-unstyled flight-schedule ms-3">
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
                    <div className="col-lg-6">
                      <div className="business-time">
                        <p>Trip time: 7 hours 45 minutes</p>
                        <p>ANA · Business class · Boeing 787 · NH 847</p>
                      </div>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightList;
