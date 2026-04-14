import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import HeroBanner from "@/components/HomeThree/HeroBanner";
import Benefits from "@/components/HomeThree/Benefits";
import Welcome from "@/components/HomeThree/Welcome";
import FunFactsTwo from "@/components/Common/FunFactsTwo";
import MostPopularPlaces from "@/components/HomeThree/MostPopularPlaces";
import Faq from "@/components/HomeThree/Faq";
import HowItWorks from "@/components/HomeThree/HowItWorks";
import PopularDestinationWeOffer from "@/components/HomeThree/PopularDestinationWeOffer";
import TestimonialSliderThree from "@/components/Common/TestimonialSliderThree";
import Partner from "@/components/Common/Partner";
import LatestBlogPost from "@/components/Common/LatestBlogPost";

export default function Home3() {
  return (
    <>
      <Navbar />

      <HeroBanner />

      <Benefits />

      <Welcome />

      <FunFactsTwo />

      <MostPopularPlaces />

      <Faq />

      <HowItWorks/>

      <PopularDestinationWeOffer />

      <TestimonialSliderThree />

      <div className="ptb-175">
        <Partner />
      </div>

      <LatestBlogPost />
  
      <Footer />
    </>
  )
}
