'use client';

import { useParams } from 'next/navigation';
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import DashboardHotelDetailsContent from "@/components/Dashboard/DashboardHotelDetailsContent";

export default function DashboardHotelDetailsPage() {
  const params = useParams();
  const hotelId = params.id as string;

  return (
    <>
      <Navbar />
      <DashboardHotelDetailsContent hotelId={hotelId} />
      <Footer />
    </>
  );
}
