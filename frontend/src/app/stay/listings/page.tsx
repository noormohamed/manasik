import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import NewsletterForm from "@/components/Common/NewsletterForm";
import PageBanner from "@/components/Stay/PageBanner";
import BookingSearchFrom from "@/components/Stay/BookingSearchFrom";
import ListingCardContent from "@/components/Stay/ListingCardContent";
import OurHottestNearbyCities from "@/components/Common/OurHottestNearbyCities";
import TopAuthorStyleTwo from "@/components/Common/TopAuthorStyleTwo";
import Navbar from "@/components/Layout/Navbar";

export default function StayListingPage() {
  return (
    <>
      <Navbar />

      <BookingSearchFrom />

      <ListingCardContent />

      <Footer />
    </>
  )
}
