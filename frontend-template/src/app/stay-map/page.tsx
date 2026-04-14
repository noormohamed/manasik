import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer"; 
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PageBanner from "@/components/Stay/PageBanner";
import BookingSearchFrom from "@/components/Stay/BookingSearchFrom";
import ListingCardWithMapContent from "@/components/Stay/ListingCardWithMapContent";
import OurHottestNearbyCities from "@/components/Common/OurHottestNearbyCities";
import TopAuthorStyleTwo from "@/components/Common/TopAuthorStyleTwo";

export default function StayMapPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBanner />

      <BookingSearchFrom />
      
      <ListingCardWithMapContent />

      <div className="bg-color-fff7ed">
        <OurHottestNearbyCities />
      </div>
 
      <TopAuthorStyleTwo />
 
      <NewsletterForm />

      <Footer />
    </>
  )
}
