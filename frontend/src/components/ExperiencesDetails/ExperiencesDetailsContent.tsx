"use client";

import Sidebar from "./Sidebar";
import Information from "./Information";
import ExperiencesDescriptions from "./ExperiencesDescriptions";
import Include from "./Include";
import ReviewsList from "./ReviewsList";
import ReviewForm from "./ReviewForm";
import Location from "./Location";
import ThingsToKnow from "./ThingsToKnow";

import Image from "next/image";

import experiencesImg1 from "/public/images/experiences/experiences-1.jpg";
import experiencesImg2 from "/public/images/experiences/experiences-2.jpg";

const ExperiencesDetailsContent = () => {
  return (
    <>
      <div className="experiences-details-area ptb-175">
        <div className="container">
          <div className="stay-details-img">
            <div className="row">
              <div className="col-lg-6">
                <Image src={experiencesImg1} alt="experiences" />
              </div>
              <div className="col-lg-6">
                <Image src={experiencesImg2} alt="experiences" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="stay-details-content">
                {/* Information */}
                <Information />

                {/* Experiences Descriptions */}
                <ExperiencesDescriptions />

                {/* Include */}
                <Include />

                {/* ReviewsList */}
                <ReviewsList />

                {/* ReviewForm */}
                <ReviewForm />

                {/* Location */}
                <Location />

                {/* ThingsToKnow */}
                <ThingsToKnow />
              </div>
            </div>

            <div className="col-lg-4">
              {/* Sidebar */}
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExperiencesDetailsContent;
