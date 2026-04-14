"use client";

import Link from "next/link";
import Image from "next/image";

import carImg1 from "/public/images/popular/popular-16.jpg";
import carImg2 from "/public/images/popular/popular-17.jpg";
import carImg3 from "/public/images/popular/popular-18.jpg";
import carImg4 from "/public/images/popular/popular-19.jpg";
import carImg5 from "/public/images/popular/popular-20.jpg";
import carImg6 from "/public/images/popular/popular-21.jpg";

const CarForRent = () => {
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg1} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}

                <span className="discount">-10% Today</span>
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(5k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">Audi Trone Electric Sport</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Central Park West Toronto</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$150</span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg2} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(1k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">Volvo Electric Model A10</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Central Park West Toronto</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$452</span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg3} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}

                <span className="discount">-10% Today</span>
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(2k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">BMW Electric Model i4</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Bryce Canyon Central Park</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$380 </span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg4} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(6k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">Hundai Kong GT Sports</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Central Park West Toronto</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$230 </span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg5} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(6k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">BMW X3 New xdrive</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Phra Nakhon Si Ayutthaya</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$510 </span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/cars-details">
                <Image src={carImg6} alt="place" />
              </Link>
              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                {/* Before favorite */}
                <button type="button" className="heart">
                  <i className="flaticon-heart"></i>
                </button>

                {/* After favorite */}
                {/* <button type="button" className="heart favorite">
                      <i className="flaticon-heart"></i>
                    </button> */}
              </div>
            </div>

            <div className="most-popular-single-content">
              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <i className="ri-star-fill"></i>
                </li>
                <li>
                  <span>(1.5k+ Rating)</span>
                </li>
              </ul>
              <h3>
                <Link href="/cars-details">New 2022 Lexus RC4</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Chatuchak Weekend Market</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <Link
                  href="/cars-details"
                  className="white-btn btn-border default-btn"
                >
                  Book Now
                </Link>
                <span>
                  <span className="title">$600 </span> / Per Person
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-12 text-center">
          <Link href="/stay" className="default-btn active mt-2">
            Show Me More
          </Link>
        </div>
      </div>
    </>
  );
};

export default CarForRent;
