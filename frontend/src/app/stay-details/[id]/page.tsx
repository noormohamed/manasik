import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import StayDetailsContent from "@/components/StayDetails/StayDetailsContent";

export default function HotelDetailsPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <StayDetailsContent hotelId={params.id} />
      <Footer />
    </>
  );
}
