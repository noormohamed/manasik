"use client";

import React, { useState } from "react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import RentForm from "./RentForm";

const BookingSearchForm: React.FC = () => {

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="banner-buy-sell-two">
        <ul className="nav nav-tabs banner-buy-sell-tabs">
          <li className="nav-item" role="presentation">
            <button
              className={activeTab === 0 ? "active" : ""}
              onClick={() => handleTabClick(0)}
            >
              Buy
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={activeTab === 1 ? "active" : ""}
              onClick={() => handleTabClick(1)}
            >
              Sell
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={activeTab === 2 ? "active" : ""}
              onClick={() => handleTabClick(2)}
            >
              Rent
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 0 && (
            <div>
              <BuyForm />
            </div>
          )}
          {activeTab === 1 && (
            <div>
              <SellForm />
            </div>
          )}
          {activeTab === 2 && (
            <div>
              <RentForm />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingSearchForm;
