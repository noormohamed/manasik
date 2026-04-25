"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import DashboardBookingsContent from "@/components/Dashboard/DashboardBookingsContent";
import ManagementPageLayout from "@/components/ManagementPageLayout/ManagementPageLayout";

const DashboardBookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <ManagementPageLayout>
        <DashboardBookingsContent />
      </ManagementPageLayout>
      <Footer />
    </>
  );
};

export default DashboardBookingsPage;
