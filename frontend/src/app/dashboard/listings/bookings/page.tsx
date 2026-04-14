import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import DashboardBookingsContent from "@/components/Dashboard/DashboardBookingsContent";

export const metadata = {
  title: "Your Bookings - Dashboard",
  description: "Manage your hotel bookings",
};

const DashboardBookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <DashboardBookingsContent />
      <Footer />
    </>
  );
};

export default DashboardBookingsPage;
