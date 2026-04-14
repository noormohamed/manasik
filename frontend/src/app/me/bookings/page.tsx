"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import MyBookingsContent from "@/components/MyBookings/MyBookingsContent";

const MyBookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <MyBookingsContent />
      <Footer />
    </>
  );
};

export default MyBookingsPage;
