"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import DashboardBrokerContent from "@/components/Dashboard/DashboardBrokerContent";
import ManagementPageLayout from "@/components/ManagementPageLayout/ManagementPageLayout";

const DashboardBrokerPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <ManagementPageLayout>
        <DashboardBrokerContent />
      </ManagementPageLayout>
      <Footer />
    </>
  );
};

export default DashboardBrokerPage;
