"use client";

import React from "react";
import Image from "next/image";

const funFactsData = [
  {
    id: "1",
    icon: "/images/icons/icon10.png",
    number: "15",
    title: "Years Of Experience",
  },
  {
    id: "2",
    icon: "/images/icons/icon11.png",
    number: "25K",
    title: "Apartments Rent",
  },
  {
    id: "3",
    icon: "/images/icons/icon12.png",
    number: "540",
    title: "Years Of Experience",
  },
  {
    id: "4",
    icon: "/images/icons/icon13.png",
    number: "650",
    title: "Apart Rooms",
  },
];

const FunFacts: React.FC = () => {
  return (
    <>
      {funFactsData && (
        <div className="funfact-area bg-color-fff7ed pb-150">
          <div className="container">
            <div className="d-lg-flex justify-content-between">
              {funFactsData &&
                funFactsData.map((value, i) => (
                  <div className="col-lg-25" key={i}>
                    <div className="funfact-single-item">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <Image src={value.icon} alt="icon" width={70} height={70} />
                        </div>
                        <div className="flex-grow-1 funfact-single-content">
                          <h4>{value.number}+</h4>
                          <p>{value.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FunFacts;
