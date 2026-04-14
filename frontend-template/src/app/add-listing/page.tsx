import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import ChoosingListingCategories from "@/components/AddListing/ChoosingListingCategories";

export default function AddListingPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-6.jpg"
      />

      <ChoosingListingCategories />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
