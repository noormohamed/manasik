import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import Amenities from "@/components/AddListing/Amenities";

export default function AddListingFourPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 4" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-7.jpg"
      />

      <Amenities />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
