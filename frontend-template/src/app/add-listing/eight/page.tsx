import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PriceYourSpace from "@/components/AddListing/PriceYourSpace";

export default function AddListingEightPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 8" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-12.jpg"
      />

      <PriceYourSpace />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
