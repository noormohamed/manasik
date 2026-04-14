"use client";

import Link from "next/link";
import Image from "next/image";

import blackLogo from "/public/logos/2.png";
import whiteLogo from "/public/logos/1.png";

// socialsLinkData
const socialsLinkData = [
  {
    iconName: "ri-facebook-fill",
    url: "https://www.facebook.com/",
  },
  {
    iconName: "ri-twitter-fill",
    url: "https://www.twitter.com/",
  },
  {
    iconName: "ri-instagram-line",
    url: "https://www.instagram.com/",
  },
  {
    iconName: "ri-linkedin-fill",
    url: "https://www.linkedin.com/",
  },
];

const Footer = () => {
  return (
    <>
      <div className="footer-area pt-175 pb-150">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4">
              <div className="footer-single-widget mw-310">
                <Link href="/" className="logo d-inline-block">
                  <Image
                    src={blackLogo}
                    className="d-block dark-none"
                    alt="logo"
                  />
                  <Image
                    src={whiteLogo}
                    className="d-none dark-block"
                    alt="logo"
                  />
                </Link>

                <p>
                  Lorem ipsum dolor amet consec tetur adipiscing elit eiusmod
                  tempor incididunt labore dolore magna aliqua
                </p>

                {socialsLinkData && (
                  <ul className="d-flex align-items-center p-0 mb-0 list-unstyled follow-us">
                    {socialsLinkData &&
                      socialsLinkData.map((value, i) => (
                        <li key={i}>
                          <a href={value.url} target="_blank">
                            <i className={value.iconName}></i>
                          </a>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row">
                <div className="col-lg-4 col-sm-6">
                  <div className="footer-single-widget">
                    <h3>Quick Links</h3>

                    <ul className="p-0 m-0 list-unstyled import-link">
                      <li>
                        <Link href="/stay">Hotel Booking</Link>
                      </li>
                      <li>
                        <Link href="/cars">Car Rental</Link>
                      </li>
                      <li>
                        <Link href="/stay">Bus Ticket</Link>
                      </li>
                      <li>
                        <Link href="/flight">Flight Booking</Link>
                      </li>
                      <li>
                        <Link href="/stay">Restaurant</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="col-lg-4 col-sm-6">
                  <div className="footer-single-widget">
                    <h3>Official Info</h3>

                    <ul className="p-0 m-0 list-unstyled import-link">
                      <li>
                        <Link href="/experiences">France Experience</Link>
                      </li>
                      <li>
                        <Link href="/experiences-details">
                          Ancient Rome Discover
                        </Link>
                      </li>
                      <li>
                        <Link href="/stay-map">Get Into Naxos Island</Link>
                      </li>
                      <li>
                        <Link href="/experiences-map">
                          Vietnam Island Experience
                        </Link>
                      </li>
                      <li>
                        <Link href="/stay">Travel City</Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-lg-4 col-sm-6">
                  <div className="footer-single-widget">
                    <h3>Official Info</h3>

                    <ul className="p-0 m-0 list-unstyled info-official">
                      <li className="d-flex">
                        <i className="ri-map-pin-2-fill"></i>
                        <div className="ms-3">
                          <h4>Location:</h4>
                          <span>70-80 Upper St Norwich NR2 London United Kingdom</span>
                        </div>
                      </li>
                      <li className="d-flex">
                        <i className="ri-mail-fill"></i>
                        <div className="ms-3">
                          <h4>Email:</h4>
                          <a href="mailto:hello@sado.com">hello@sado.com</a>
                        </div>
                      </li>
                      <li className="d-flex">
                        <i className="ri-phone-fill"></i>
                        <div className="ms-3">
                          <h4>Phone:</h4>
                          <a href="tel:(+30)098765432150">(+30) 098765432150</a>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copy-right-area">
        <div className="container">
          <p>
            © <span>Sado</span> is Proudly Owned by{" "}
            <a href="https://hibootstrap.com/" target="_blank">
              HiBootstrap
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
