import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer"; 
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PageBanner from "@/components/Flight/PageBanner";
import BookingSearchFrom from "@/components/Flight/BookingSearchFrom";
import FlightList from "@/components/Flight/FlightList";
import PopularDestination from "@/components/HomeOne/PopularDestination";
import TopAuthor from "@/components/Common/TopAuthor";
import Partner from "@/components/Common/Partner";
  
export default function FlightPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBanner />

      <BookingSearchFrom />
      
      <FlightList />
 
      <PopularDestination />
     
      <TopAuthor />

      <div className="ptb-175">
        <Partner />
      </div>

      <NewsletterForm />

      <Footer />
    </>
  )
}
