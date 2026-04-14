import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer"; 
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PageBanner from "@/components/Experiences/PageBanner";
import BookingSearchFrom from "@/components/Experiences/BookingSearchFrom";
import ExperienceCardContent from "@/components/Experiences/ExperienceCardContent";
import PopularDestination from "@/components/HomeOne/PopularDestination";
import TopAuthorSlider from "@/components/Common/TopAuthorSlider";
  
export default function ExperiencesPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBanner />

      <BookingSearchFrom />
      
      <ExperienceCardContent />

      <div className="pt-175 bg-color-fff7ed">
        <PopularDestination />
      </div>
 
      <TopAuthorSlider />

      <NewsletterForm />

      <Footer />
    </>
  )
}
