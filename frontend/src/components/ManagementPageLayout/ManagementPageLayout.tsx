"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./ManagementPageLayout.css";

interface ManagementPageLayoutProps {
  children: React.ReactNode;
}

const ManagementPageLayout: React.FC<ManagementPageLayoutProps> = ({ children }) => {
  const currentRoute = usePathname();

  const menuItems = [
    {
      label: "Hotel Bookings",
      href: "/dashboard/listings/bookings",
      icon: "ri-calendar-check-line",
    },
    {
      label: "Hotels",
      href: "/dashboard/listings",
      icon: "ri-building-line",
    },
    {
      label: "Payments",
      href: "/payments",
      icon: "ri-wallet-line",
    },
  ];

  const isActive = (href: string) => {
    // Exact match for /dashboard/listings to avoid matching /dashboard/listings/bookings
    if (href === "/dashboard/listings") {
      return currentRoute === "/dashboard/listings";
    }
    // For other routes, allow prefix matching
    return currentRoute === href || currentRoute.startsWith(href + "/");
  };

  return (
    <div className="management-page-layout">
      {/* Header Banner */}
      <div className="management-header-banner">
        <div className="management-header-content">
          <h1 className="management-title">Management Suite</h1>
          <p className="management-subtitle">Manage your hotels and bookings</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="management-nav-wrapper">
        <div className="management-nav-inner">
          <ul className="management-nav-menu">
            {menuItems.map((item) => (
              <li key={item.href} className="management-nav-item">
                <Link
                  href={item.href}
                  className={`management-nav-link ${
                    isActive(item.href) ? "active" : ""
                  }`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="management-content-wrapper">
        <div className="management-content-inner">{children}</div>
      </div>
    </div>
  );
};

export default ManagementPageLayout;
