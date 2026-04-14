"use client";

import { useSearchParams } from "next/navigation";
import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import StayDetailsContent from "@/components/StayDetails/StayDetailsContent";
import Navbar from "@/components/Layout/Navbar";

export default function StayDetailsPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId') || '';

  return (
    <>
      <Navbar />
      <StayDetailsContent hotelId={hotelId} />
      <Footer />
    </>
  )
}
