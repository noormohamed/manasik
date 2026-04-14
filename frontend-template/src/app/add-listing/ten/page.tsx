import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import CongratulationsThisIsYourListing from "@/components/AddListing/CongratulationsThisIsYourListing";

export default function AddListingTenPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 10" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-14.jpg"
      />

      <CongratulationsThisIsYourListing />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
