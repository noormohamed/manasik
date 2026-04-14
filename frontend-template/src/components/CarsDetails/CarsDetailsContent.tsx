"use client";

import Sidebar from "./Sidebar";
import CarsDescriptions from "./CarsDescriptions";
import VehicleParametersAndUtilities from "./VehicleParametersAndUtilities"; 
import Include from "./Include"; 
import ReviewsList from "./ReviewsList";
import ReviewForm from "./ReviewForm";
import Location from "./Location";
import ThingsToKnow from "./ThingsToKnow";
import Information from "./Information";
import Image from "next/image";

import carDetailsImg from "/public/images/car-details.jpg";

const CarsDetailsContent = () => {
  return (
    <>
      <div className="experiences-details-area ptb-175">
        <div className="container">
          <div className="stay-details-img">
            <Image src={carDetailsImg} alt="carDetails" />
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="stay-details-content">
                {/* Information */}
                <Information />

                {/* VehicleParametersAndUtilities */}
                <VehicleParametersAndUtilities /> 

                {/* Cars Descriptions */}
                <CarsDescriptions />

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

export default CarsDetailsContent;
