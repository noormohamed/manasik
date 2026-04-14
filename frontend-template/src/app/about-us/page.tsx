import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import AboutUsContent from "@/components/AboutUs/AboutUsContent";
import Benefits from "@/components/HomeThree/Benefits";
import TestimonialSliderFour from "@/components/Common/TestimonialSliderFour";
import TopAuthorSlider from "@/components/Common/TopAuthorSlider";
import Partner from "@/components/Common/Partner";
import Faq from "@/components/AboutUs/Faq";
import FunFacts from "@/components/AboutUs/FunFacts";

export default function AboutUsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Know About Us" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-1.jpg"
      />

      <AboutUsContent />

      <Benefits />

      <TestimonialSliderFour />

      <TopAuthorSlider />

      <div className="pb-175">
        <Partner />
      </div>

      <Faq />

      <FunFacts />
 
      <Footer />
    </>
  )
}
