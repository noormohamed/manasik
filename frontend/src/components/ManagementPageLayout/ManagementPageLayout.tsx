"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CreateBookingModal from "@/components/Dashboard/CreateBookingModal";
import "./ManagementPageLayout.css";

interface SubMenuItem {
  label: string;
  href?: string;
  action?: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  subItems?: SubMenuItem[];
}

interface ManagementPageLayoutProps {
  children: React.ReactNode;
}

const ManagementPageLayout: React.FC<ManagementPageLayoutProps> = ({ children }) => {
  const currentRoute = usePathname();
  const router = useRouter();
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: "Broker",
      href: "/dashboard/listings/broker",
      icon: "ri-user-shared-line",
      subItems: [
        { label: "Broker Bookings", href: "/dashboard/listings/broker" },
        { label: "Add Booking", action: "openCreateBooking" },
      ],
    },
    {
      label: "Hotels",
      href: "/dashboard/listings",
      icon: "ri-building-line",
      subItems: [
        { label: "Listings", href: "/dashboard/listings" },
        { label: "Hotel Bookings", href: "/dashboard/listings/bookings" },
        { label: "Add Booking", action: "openCreateBooking" },
      ],
    },
    {
      label: "Payments",
      href: "/payments",
      icon: "ri-wallet-line",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/listings") {
      return currentRoute === "/dashboard/listings";
    }
    return currentRoute === href || currentRoute.startsWith(href + "/");
  };

  const isParentActive = (item: MenuItem) => {
    // Broker: only active on its own route
    if (item.href === "/dashboard/listings/broker") {
      return currentRoute === "/dashboard/listings/broker" || currentRoute.startsWith("/dashboard/listings/broker/");
    }
    // Hotels: active on /dashboard/listings and sub-pages, but NOT broker
    if (item.href === "/dashboard/listings") {
      if (currentRoute === "/dashboard/listings") return true;
      if (currentRoute.startsWith("/dashboard/listings/") 
          && !currentRoute.startsWith("/dashboard/listings/broker")) {
        return true;
      }
      return false;
    }
    if (item.subItems) {
      return item.subItems.some(
        (sub) => sub.href && (currentRoute === sub.href || currentRoute.startsWith(sub.href + "/"))
      );
    }
    return isActive(item.href);
  };

  const isSubActive = (href: string) => {
    if (href === "/dashboard/listings") {
      // "Listings" is active for exact /dashboard/listings or /dashboard/listings/[id] detail pages
      // but NOT for /dashboard/listings/bookings or /dashboard/listings/broker
      if (currentRoute === "/dashboard/listings") return true;
      if (currentRoute.startsWith("/dashboard/listings/") 
          && !currentRoute.startsWith("/dashboard/listings/bookings")
          && !currentRoute.startsWith("/dashboard/listings/broker")) {
        return true;
      }
      return false;
    }
    return currentRoute === href || currentRoute.startsWith(href + "/");
  };

  const handleSubItemClick = (sub: SubMenuItem) => {
    if (sub.action === "openCreateBooking") {
      setShowCreateBookingModal(true);
    }
  };

  const handleBookingCreated = useCallback(() => {
    setShowCreateBookingModal(false);
    // Navigate to bookings page to see the new booking
    router.push("/dashboard/listings/bookings");
  }, [router]);

  // Find the active parent that has sub-items
  const activeParent = menuItems.find(
    (item) => item.subItems && isParentActive(item)
  );

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
                    isParentActive(item) ? "active" : ""
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

      {/* Secondary Sub-Menu */}
      {activeParent?.subItems && (
        <div className="management-submenu-wrapper">
          <div className="management-submenu-inner">
            <ul className="management-submenu">
              {activeParent.subItems.map((sub, idx) => (
                <li key={sub.href || `action-${idx}`} className="management-submenu-item">
                  {sub.href ? (
                    <Link
                      href={sub.href}
                      className={`management-submenu-link ${
                        isSubActive(sub.href) ? "active" : ""
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="management-submenu-link management-submenu-button"
                      onClick={() => handleSubItemClick(sub)}
                    >
                      {sub.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="management-content-wrapper">
        <div className="management-content-inner">{children}</div>
      </div>

      {/* Create Booking Modal - available from any hotel page */}
      <CreateBookingModal
        isOpen={showCreateBookingModal}
        onClose={() => setShowCreateBookingModal(false)}
        hotelId=""
        onBookingCreated={handleBookingCreated}
        mode="broker"
      />
    </div>
  );
};

export default ManagementPageLayout;
