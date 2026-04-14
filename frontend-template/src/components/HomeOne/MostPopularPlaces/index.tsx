"use client";

import React, { useState } from "react";
import Tanzania from "./Tanzania";
import Morocco from "./Morocco";
import Thailand from "./Thailand";

const MostPopularPlaces: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="most-popular-area bg-color-fff7ed ptb-175">
        <div className="container">
          <div className="d-md-flex justify-content-between align-items-center mb-70">
            <div className="section-title mb-0 left-title">
              <span className="top-title">FEATURED PLACES</span>
              <h2>Most Popular Places</h2>
            </div>

            <ul className="nav nav-tabs most-popular-tab mt-3 mt-md-0">
              <li className="nav-item">
                <button
                  className={activeTab === 0 ? "active" : ""}
                  onClick={() => handleTabClick(0)}
                >
                  Tanzania
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={activeTab === 1 ? "active" : ""}
                  onClick={() => handleTabClick(1)}
                >
                  Morocco
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={activeTab === 2 ? "active" : ""}
                  onClick={() => handleTabClick(2)}
                >
                  Thailand
                </button>
              </li>
            </ul>
          </div>

          <div className="custom-tabs">
            <div className="tab-content">
              {activeTab === 0 && (
                <div>
                  <Tanzania />
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <Morocco />
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <Thailand />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MostPopularPlaces;
