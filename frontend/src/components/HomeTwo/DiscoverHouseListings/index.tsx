"use client";

import React, { useState } from "react";
import Residential from "./Residential";
import Commercial from "./Commercial";
import Apartments from "./Apartments";

const DiscoverHouseListings: React.FC = () => {

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="house-listing-area pb-175">
        <div className="container">
          <div className="d-xl-flex justify-content-between align-items-center mb-70">
            <div className="section-title mb-0 left-title">
              <span className="top-title">HOUSE LISTINGS</span>
              <h2>Discover House Listings</h2>
            </div>

            <ul className="nav nav-tabs most-popular-tab mt-3 mt-xl-0">
              <li className="nav-item">
                <button
                  className={activeTab === 0 ? "active" : ""}
                  onClick={() => handleTabClick(0)}
                >
                  Residential
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={activeTab === 1 ? "active" : ""}
                  onClick={() => handleTabClick(1)}
                >
                  Commercial
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={activeTab === 2 ? "active" : ""}
                  onClick={() => handleTabClick(2)}
                >
                  Apartments
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            {activeTab === 0 && (
              <div>
                <Residential />
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <Commercial />
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <Apartments />
              </div>
            )}
          </div> 
				</div>
      </div>
    </>
  );
};

export default DiscoverHouseListings;
