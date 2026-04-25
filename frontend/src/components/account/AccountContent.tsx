"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountInfo from './AccountInfo';
import SaveLists from "./SaveLists";
import ChangePassword from "./ChangePassword";
import ChangeBilling from "./ChangeBilling";

const AccountContent = () => {
  const currentRoute = usePathname();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="container pt-5 pb-3">
        <div className="row">
          <div className="col-xl-8 col-xxl-9">
            <ul className="nav nav-tabs most-popular-tab">
              <li className="nav-item" role="presentation">
                <button>
                  <Link href={currentRoute && currentRoute.includes('/dashboard/listings') ? "/dashboard/listings/bookings" : "/dashboard/bookings"} className={`dropdown-item ${(currentRoute === "/dashboard/bookings" || currentRoute === "/dashboard/listings/bookings") ? "active" : ""}`}>
                    Your Bookings
                  </Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link href="/dashboard/listings" className={`dropdown-item ${currentRoute === "/dashboard/listings" ? "active" : ""}`}>
                    Your Listings
                  </Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link href="/account/" className={`dropdown-item ${currentRoute === "/account/" || currentRoute === "/account" ? "active" : ""}`}>
                    Account
                  </Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link href="/payments/" className={`dropdown-item ${currentRoute === "/payments/" || currentRoute === "/payments" ? "active" : ""}`}>
                    Payments
                  </Link>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="account-area pb-5">
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
                  Payment Details
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
