import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import HeroBanner from "@/components/HomeTwo/HeroBanner";
import Footer from "@/components/Layout/Footer";
import Partner from "@/components/Common/Partner";
import DiscoverHouseListings from "@/components/HomeTwo/DiscoverHouseListings";
import HowItWorks from "@/components/HomeTwo/HowItWorks";
import WhyChooseUs from "@/components/HomeTwo/WhyChooseUs";
import OurHottestNearbyCities from "@/components/Common/OurHottestNearbyCities";
import TopAuthorSlider from "@/components/Common/TopAuthorSlider";
import FunFacts from "@/components/Common/FunFacts";
import TestimonialSliderTwo from "@/components/Common/TestimonialSliderTwo";
import BrowseNewAddedProperties from "@/components/HomeTwo/BrowseNewAddedProperties";
import Faq from "@/components/HomeTwo/Faq";

export default function Home2() {
  return (
    <>
      <NavbarStyleTwo />

      <HeroBanner />

      <div className="ptb-175">
        <Partner />
      </div>

      <DiscoverHouseListings />

      <HowItWorks />

      <WhyChooseUs />

      <OurHottestNearbyCities />

      <div className="bg-color-fff7ed">
        <TopAuthorSlider />
      </div>

      <FunFacts />

      <TestimonialSliderTwo />

      <BrowseNewAddedProperties />

      <Faq />
  
      <Footer />
    </>
  )
}
