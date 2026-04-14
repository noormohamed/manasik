"use client";

import React from "react";
import Image from "next/image";

const benefitsData = [
  {
    id: "1",
    icon: "/images/icons/icon1.png",
    title: "Exclusive Trip",
    shortText:
      "Sliquam ses justo sit amet urna set uctor sceris quinterdum anet temp",
  },
  {
    id: "2",
    icon: "/images/icons/icon2.png",
    title: "Lots Of Choices",
    shortText:
      "Sliquam ses justo sit amet urna set uctor sceris quinterdum anet temp",
  },
  {
    id: "3",
    icon: "/images/icons/icon3.png",
    title: "Professional Guide",
    shortText:
      "Sliquam ses justo sit amet urna set uctor sceris quinterdum anet temp",
  },
];

const Benefits: React.FC = () => {
  return (
    <>
      <div className="benefits-area pt-175 pb-150">
        <div className="container">
          <div 
            className="section-title"
          >
            <span className="top-title">BENEFITS</span>
            <h2>Sado is a World Leading Online Booking Platform</h2>
          </div>

          {benefitsData && (
            <div 
              className="row justify-content-center" 
            >
              {benefitsData &&
                benefitsData.map((value, i) => (
                  <div className="col-lg-4 col-sm-6 for-child" key={i}>
                    <div className="benefits-single-item me-lg-auto">
                      <Image src={value.icon} alt="icon" width={110} height={110} />
                      <h5>{value.title}</h5>
                      <p>{value.shortText}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Benefits;
