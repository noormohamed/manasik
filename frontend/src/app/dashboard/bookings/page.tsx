"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import DashboardBookingsContent from "@/components/Dashboard/DashboardBookingsContent";

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
