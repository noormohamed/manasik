import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import YouPlaceDescriptionForCustomer from "@/components/AddListing/YouPlaceDescriptionForCustomer";

export default function AddListingSixPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 6" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-10.jpg"
      />

      <YouPlaceDescriptionForCustomer />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
