import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer"; 
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PageBanner from "@/components/Cars/PageBanner";
import BookingSearchFrom from "@/components/Cars/BookingSearchFrom";
import CarsCardWithMapContent from "@/components/Cars/CarsCardWithMapContent";
import OurHottestNearbyCities from "@/components/Common/OurHottestNearbyCities";
import TopAuthor from "@/components/Common/TopAuthor";
  
export default function CarsMapPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBanner />

      <BookingSearchFrom />
      
      <CarsCardWithMapContent />
 
      <TopAuthor />
 
      <OurHottestNearbyCities />
     
      <NewsletterForm />

      <Footer />
    </>
  )
}
