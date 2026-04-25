"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DarkAndLightMode from "./DarkAndLightMode";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";

import Image from "next/image";

import blackLogo from "/public/logos/2.png";
import whiteLogo from "/public/logos/1.png";
import menuImg1 from "/public/images/menu/menu-1.jpg";
import menuImg2 from "/public/images/menu/menu-2.jpg";
import menuImg3 from "/public/images/menu/menu-3.jpg";
import menuImg4 from "/public/images/menu/menu-4.jpg";
import menuImg5 from "/public/images/menu/menu-5.jpg";

const Navbar: React.FC = () => {
  // Toggle active class
  const [isActive, setActive] = useState<boolean>(false);
  const handleToggleSearchModal = () => {
    setActive(!isActive);
  };

  const currentRoute = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { itemCount } = useCart();

  const [menu, setMenu] = useState<boolean>(true);

  const toggleNavbar = () => {
    setMenu(!menu);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    let elementId = document.getElementById("navbar");
    document.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("sticky");
      } else {
        elementId?.classList.remove("sticky");
      }
    });
  }, []);

  const classOne: string = menu
    ? "collapse navbar-collapse mean-menu"
    : "collapse navbar-collapse show";
  const classTwo: string = menu
    ? "navbar-toggler navbar-toggler-right collapsed"
    : "navbar-toggler navbar-toggler-right";

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-color-f3f4f6" id="navbar">
        <div className="container-fluid mw-1640">
          <Link className="navbar-brand" href="/">
            <Image src={blackLogo} className="main-logo" alt="Black logo" />
            <Image
              src={whiteLogo}
              className="white-logo d-none"
              alt="White logo"
            />
          </Link>

          {/* Hamburger Toggle Button */}
          <button
            onClick={toggleNavbar}
            className={classTwo}
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="icon-bar top-bar"></span>
            <span className="icon-bar middle-bar"></span>
            <span className="icon-bar bottom-bar"></span>
          </button>

          {/* Main Navigation - 3 Links (Collapsible on mobile) */}
          <div className={classOne} id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto me-auto">
              <li className="nav-item">
                <Link className="nav-link" href="/stay">
                  <i className="ri-building-line me-2"></i>
                  Hotels
                </Link>
              </li>
              {user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" href="/me/bookings">
                      <i className="ri-calendar-check-line me-2"></i>
                      Bookings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" href="/dashboard/messages">
                      <i className="ri-mail-line me-2"></i>
                      Messages
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Right Side - Account Menu & Cart */}
          <div className="others-options">
            <ul className="navbar-nav ms-auto">
              {/* Account Dropdown */}
              {user && (
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-link nav-link dropdown-toggle p-0"
                    type="button"
                    id="accountDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ri-user-line" style={{ fontSize: '20px' }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                    <li>
                      <Link
                        href="/dashboard/listings/bookings/"
                        className={`dropdown-item ${
                          currentRoute?.includes('/dashboard/listings/bookings') ? "active" : ""
                        }`}
                      >
                        <i className="ri-building-4-line me-2"></i>
                        Management
                      </Link>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li>
                      <Link
                        href="/account/"
                        className={`dropdown-item ${
                          currentRoute === "/account/" ? "active" : ""
                        }`}
                      >
                        <i className="ri-user-settings-line me-2"></i>
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/payments/"
                        className={`dropdown-item ${
                          currentRoute === "/payments/" ? "active" : ""
                        }`}
                      >
                        <i className="ri-wallet-line me-2"></i>
                        Payments
                      </Link>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item"
                        style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                      >
                        <i className="ri-logout-box-line me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              {/* Cart Icon */}
              <li className="nav-item">
                <Link href="/checkout" className="nav-link position-relative">
                  <i className="ri-shopping-cart-line" style={{ fontSize: '20px' }}></i>
                  {itemCount > 0 && (
                    <span 
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* Login Button */}
              <li>
                {loading ? (
                  <span className="default-btn active">Loading...</span>
                ) : user ? (
                  <></>
                ) : (
                  <Link href="/auth/" className="default-btn active">
                    Login Now
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
