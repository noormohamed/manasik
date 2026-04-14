"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import BrokerBookingsContent from "@/components/Broker/BrokerBookingsContent";

const BrokerBookingsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <BrokerBookingsContent />
      <Footer />
    </>
  );
};

export default BrokerBookingsPage;
