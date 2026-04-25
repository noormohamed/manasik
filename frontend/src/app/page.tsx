import Navbar from "@/components/Layout/Navbar";
import DiscoverGreatPlaces from "@/components/Common/DiscoverGreatPlaces";
import NewsletterForm from "@/components/Common/NewsletterForm";
import TestimonialSlider from "@/components/Common/TestimonialSlider";
import TopAuthor from "@/components/Common/TopAuthor";
import Benefits from "@/components/HomeThree/Benefits";
import HeroBanner from "@/components/HomeThree/HeroBanner";
import HowItWorks from "@/components/HomeThree/HowItWorks";
import MostPopularPlaces from "@/components/HomeThree/MostPopularPlaces";
import Welcome from "@/components/HomeThree/Welcome";
import RecentActivity from "@/components/Home/RecentActivity";
import Footer from "@/components/Layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
 
      <HeroBanner />

      <RecentActivity />

      <Welcome />

      <MostPopularPlaces />

      <TestimonialSlider />

      <NewsletterForm />

      <Footer />
    </>
  )
}
