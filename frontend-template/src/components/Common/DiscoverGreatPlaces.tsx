"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const discoverGreatPlacesData = [
  {
    id: "1",
    url: "/stay-details",
    image: "/images/discover/discover-1.jpg",
    location: "New York",
    distance: "10 Minutes Drive",
  },
  {
    id: "2",
    url: "/stay-details",
    image: "/images/discover/discover-2.jpg",
    location: "Thailand",
    distance: "5 Minutes Drive",
  },
  {
    id: "3",
    url: "/stay-details",
    image: "/images/discover/discover-3.jpg",
    location: "Singapore",
    distance: "15 Minutes Drive",
  },
  {
    id: "4",
    url: "/stay-details",
    image: "/images/discover/discover-4.jpg",
    location: "France",
    distance: "20 Minutes Drive",
  },
  {
    id: "5",
    url: "/stay-details",
    image: "/images/discover/discover-5.jpg",
    location: "Paris",
    distance: "6 Minutes Drive",
  },
  {
    id: "6",
    url: "/stay-details",
    image: "/images/discover/discover-6.jpg",
    location: "Maldives",
    distance: "7 Minutes Drive",
  },
  {
    id: "7",
    url: "/stay-details",
    image: "/images/discover/discover-7.jpg",
    location: "Tokyo",
    distance: "10 Minutes Drive",
  },
  {
    id: "8",
    url: "/stay-details",
    image: "/images/discover/discover-8.jpg",
    location: "Japan",
    distance: "5 Minutes Drive",
  },
  {
    id: "9",
    url: "/stay-details",
    image: "/images/discover/discover-9.jpg",
    location: "Italy",
    distance: "10 Minutes Drive",
  },
  {
    id: "10",
    url: "/stay-details",
    image: "/images/discover/discover-10.jpg",
    location: "London",
    distance: "10 Minutes Drive",
  },
  {
    id: "11",
    url: "/stay-details",
    image: "/images/discover/discover-12.jpg",
    location: "Canada",
    distance: "10 Minutes Drive",
  },
  {
    id: "12",
    url: "/stay-details",
    image: "/images/discover/discover-12.jpg",
    location: "America",
    distance: "10 Minutes Drive",
  },
];

const DiscoverGreatPlaces: React.FC = () => {
  return (
    <>
      <div className="discover-area bg-color-f3f4f6 pt-175 pb-150">
        <div className="container">
          <div 
            className="section-title"
          >
            <span className="top-title">EXPLORE NEARBY</span>
            <h2>Discover Great Places Where You Live</h2>
          </div>

          {discoverGreatPlacesData && (
            <div 
              className="row justify-content-center"
            >
              {discoverGreatPlacesData &&
                discoverGreatPlacesData.map((value, i) => (
                  <div className="col-xxl-2 col-lg-3 col-sm-6 col-md-4" key={i}>
                    <Link
                      href={value.url}
                      className="discover-single-item text-decoration-none d-block"
                    >
                      <Image
                        src={value.image}
                        className="rounded-circle"
                        alt={value.location}
                        width={100}
                        height={100}
                      />
                      <h4>{value.location}</h4>
                      <span>{value.distance}</span>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscoverGreatPlaces;
