import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer"; 
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PageBanner from "@/components/Experiences/PageBanner";
import BookingSearchFrom from "@/components/Experiences/BookingSearchFrom";
import ExperienceCardWithMapContent from "@/components/Experiences/ExperienceCardWithMapContent";
import PopularDestination from "@/components/HomeOne/PopularDestination";
import TopAuthorSlider from "@/components/Common/TopAuthorSlider";
  
export default function ExperiencesMapPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBanner />

      <BookingSearchFrom />
      
      <ExperienceCardWithMapContent />

      <div className="pt-175 bg-color-fff7ed">
        <PopularDestination />
      </div>
 
      <TopAuthorSlider />

      <NewsletterForm />

      <Footer />
    </>
  )
}
