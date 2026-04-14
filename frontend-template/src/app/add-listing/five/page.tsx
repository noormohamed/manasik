import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import SetHouseRulesForYourGuests from "@/components/AddListing/SetHouseRulesForYourGuests";

export default function AddListingFivePage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 5" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-9.jpg"
      />

      <SetHouseRulesForYourGuests />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
