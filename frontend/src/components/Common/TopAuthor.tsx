"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const topAuthorData = [
  {
    id: "1",
    image: "/images/author/author-1.jpg",
    name: "Hardick Pandey",
    location: "New York",
    rating: "4.9",
  },
  {
    id: "2",
    image: "/images/author/author-2.jpg",
    name: "Kleerin Milan",
    location: "California",
    rating: "5.0",
  },
  {
    id: "3",
    image: "/images/author/author-3.jpg",
    name: "Hauelson Jasenit",
    location: "New York",
    rating: "4.8",
  },
  {
    id: "4",
    image: "/images/author/author-4.jpg",
    name: "Saraiz Conalin",
    location: "United States",
    rating: "4.9",
  },
  {
    id: "5",
    image: "/images/author/author-5.jpg",
    name: "Bonita Fredrick",
    location: "United Kingdom",
    rating: "5.0",
  },
  {
    id: "6",
    image: "/images/author/author-6.jpg",
    name: "Schaden Auer",
    location: "New York",
    rating: "4.5",
  },
  {
    id: "7",
    image: "/images/author/author-7.jpg",
    name: "Mauren Sarai",
    location: "Canada",
    rating: "4.2",
  },
  {
    id: "8",
    image: "/images/author/author-8.jpg",
    name: "Spenser Cedrik",
    location: "New York",
    rating: "4.5",
  },
];

const TopAuthor: React.FC = () => {
  return (
    <>
      <div className="author-area bg-color-fff7ed ptb-175">
        <div className="container">
          <div 
            className="section-title"
          >
            <span className="top-title">TOP AUTHOR</span>
            <h2>Top 08 Author Of The Month</h2>
          </div>

          <div 
            className="row justify-content-center"
          >
            {topAuthorData &&
              topAuthorData.map((value, i) => (
                <div className="col-lg-3 col-sm-6" key={i}>
                  <div className="author-single-item">
                    <Image src={value.image} alt={value.name} width={100} height={100} />
                    <h3>{value.name}</h3>

                    <span className="author-single-location">
                      {value.location}
                    </span>

                    <div className="d-flex align-items-center justify-content-center">
                      <div className="rate">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_3558_155)">
                            <path
                              d="M16.9557 6.5211C16.8444 6.17687 16.5391 5.93238 16.1779 5.89982L11.2712 5.45429L9.33096 0.913001C9.1879 0.580183 8.86209 0.364746 8.50009 0.364746C8.13809 0.364746 7.81227 0.580183 7.66921 0.913779L5.72898 5.45429L0.821537 5.89982C0.460962 5.93316 0.15642 6.17687 0.044486 6.5211C-0.0674477 6.86533 0.0359256 7.2429 0.308691 7.4809L4.01755 10.7336L2.92389 15.5512C2.84387 15.9054 2.98135 16.2715 3.27526 16.484C3.43324 16.5981 3.61806 16.6562 3.80445 16.6562C3.96515 16.6562 4.12455 16.6129 4.26762 16.5273L8.50009 13.9977L12.731 16.5273C13.0406 16.7136 13.4309 16.6966 13.7241 16.484C14.0182 16.2709 14.1555 15.9046 14.0755 15.5512L12.9818 10.7336L16.6907 7.48155C16.9635 7.2429 17.0676 6.86598 16.9557 6.5211Z"
                              fill="#FFC107"
                            />
                          </g>
                        </svg>
                        <span>{value.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            <div className="col-lg-12 text-center mt-35">
              <Link href="/stay" className="default-btn white-btn">
                Show Me More
              </Link>
              <Link href="/author" className="default-btn active ms-4">
                Become A Host
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopAuthor;
