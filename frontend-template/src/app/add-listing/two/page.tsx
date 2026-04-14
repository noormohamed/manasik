import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import YourPlaceLocation from "@/components/AddListing/YourPlaceLocation";

export default function AddListingTwoPage() {
  return (
    <>
      <Navbar />

      <PageBannerTitle 
        title="Add Listing 2" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-6.jpg"
      />

      <YourPlaceLocation />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
