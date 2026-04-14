import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import SizeOfYourLocation from "@/components/AddListing/SizeOfYourLocation";

export default function AddListingThreePage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 3" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-7.jpg"
      />

      <SizeOfYourLocation />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
