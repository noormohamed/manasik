"use client";

import React, { useState } from "react";
import AccountInfo from './AccountInfo';
import SaveLists from "./SaveLists";
import ChangePassword from "./ChangePassword";
import ChangeBilling from "./ChangeBilling";

const AccountContent = () => {

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="account-area ptb-175">
        <div className="container">
          <div className="account-content">
            <ul className="nav nav-tabs account-tabs">
              <li className="nav-item">
                <button
                  className={activeTab === 0 ? "active" : ""}
                  onClick={() => handleTabClick(0)}
                >
                  Account Info
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={activeTab === 1 ? "active" : ""}
                  onClick={() => handleTabClick(1)}
                >
                  Save Lists
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={activeTab === 2 ? "active" : ""}
                  onClick={() => handleTabClick(2)}
                >
                  Change Password
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={activeTab === 3 ? "active" : ""}
                  onClick={() => handleTabClick(3)}
                >
                  Change Billing
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {activeTab === 0 && (
                <div>
                  {/* AccountInfo */}
                  <AccountInfo />
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  {/* SaveLists */}
                  <SaveLists />
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  {/* ChangePassword */}
                  <ChangePassword />
                </div>
              )}
              {activeTab === 3 && (
                <div>
                  {/* ChangeBilling */}
                  <ChangeBilling />
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountContent;
