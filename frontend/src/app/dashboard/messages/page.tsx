"use client";

import React from "react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import MessagesPage from "@/components/Messaging/MessagesPage";

const DashboardMessagesPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <MessagesPage />
      <Footer />
    </>
  );
};

export default DashboardMessagesPage;
