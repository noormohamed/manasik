"use client";

import React from "react";
import Image from "next/image";

const funFactsData = [
  {
    id: "1",
    icon: "/images/icons/icon15.png",
    number: "15",
    title: "Years Of Experience",
  },
  {
    id: "2",
    icon: "/images/icons/icon16.png",
    number: "98%",
    title: "Retention Rate",
  },
  {
    id: "3",
    icon: "/images/icons/icon17.png",
    number: "20K+",
    title: "Happy Customers",
  },
  {
    id: "4",
    icon: "/images/icons/icon18.png",
    number: "30+",
    title: "Award Winning",
  },
];

const FunFactsTwo: React.FC = () => {
  return (
    <>
      {funFactsData && (
        <div className="funfact-area bg-color-f3f4f6 pt-175 pb-150">
          <div className="container">
            <div className="d-lg-flex justify-content-between">
              {funFactsData &&
                funFactsData.map((value, i) => (
                  <div className="col-lg-25" key={i}>
                    <div className="funfact-single-item">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="icon">
                            <Image src={value.icon} alt="icon" width={40} height={40} />
                          </div>
                        </div>
                        <div className="flex-grow-1 funfact-single-content">
                          <h4>{value.number}</h4>
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

export default FunFactsTwo;
