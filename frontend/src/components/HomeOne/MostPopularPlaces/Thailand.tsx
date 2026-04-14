"use client";

import Link from "next/link";
import Image from "next/image";

import placeImg1 from "/public/images/popular/popular-7.jpg";
import placeImg2 from "/public/images/popular/popular-8.jpg";
import placeImg3 from "/public/images/popular/popular-9.jpg";
import placeImg4 from "/public/images/popular/popular-10.jpg";
import placeImg5 from "/public/images/popular/popular-11.jpg";
import placeImg6 from "/public/images/popular/popular-12.jpg";

const Thailand = () => {
  return (
    <>
      <div 
        className="row justify-content-center"
      >
        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg1} alt="place" />
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
                <Link href="/stay-details">Khao Yai National Park</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Chiang Mai Locality</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$150</span> / Per Person
                </p>
                <p>3 Days/6 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg2} alt="place" />
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
                <Link href="/stay-details">Java Bali One Life Adventures</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>The Grand Palace</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$452</span> / Per Person
                </p>
                <p>3 Days/6 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg3} alt="place" />
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
                <Link href="/stay-details">Yucatan Peninsula Caribbean</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Khao Sok National Park</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$380</span> / Per Person
                </p>
                <p>2 Days/5 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg4} alt="place" />
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
                <Link href="/stay-details">Mykonos And Santorini Tour</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Mueang Chiang Rai</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$621</span> / Per Person
                </p>
                <p>5 Days/7 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg5} alt="place" />
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
                <Link href="/stay-details">Los Glaciares & Fitz Roy Trip</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Phra Nakhon Si Ayutthaya</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$510</span> / Per Person
                </p>
                <p>3 Days/6 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="most-popular-single-item">
            <div className="most-popular-single-img position-relative">
              <Link href="/stay-details">
                <Image src={placeImg6} alt="place" />
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
                <Link href="/stay-details">Best Western Caders Hotel</Link>
              </h3>

              <div className="d-flex align-items-center most-popular-single-location">
                <i className="flaticon-location"></i>
                <span>Chatuchak Weekend Market</span>
              </div>

              <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                <p>
                  <span className="title">$180</span> / Per Person
                </p>
                <p>4 Days/6 Night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-12 text-center">
          <Link href="/stay" className="default-btn active mt-35">
            Show Me More
          </Link>
        </div>
      </div>
    </>
  );
};

export default Thailand;
