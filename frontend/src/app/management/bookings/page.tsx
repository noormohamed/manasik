"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import ManagementBookingsContent from "@/components/Management/ManagementBookingsContent";

const ManagementBookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <ManagementBookingsContent />
      <Footer />
    </>
  );
};

export default ManagementBookingsPage;
