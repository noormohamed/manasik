import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import HowLongCanGuestsStay from "@/components/AddListing/HowLongCanGuestsStay";

export default function AddListingNinePage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 9" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-13.jpg"
      />

      <HowLongCanGuestsStay />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
