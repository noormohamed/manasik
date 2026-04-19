"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { MyBookingsPage as MyBookingsContent } from "@/components/MyBookings";

const BookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <MyBookingsContent />
      <Footer />
    </>
  );
};

export default BookingsPage;
