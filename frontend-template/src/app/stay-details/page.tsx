import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import StayDetailsContent from "@/components/StayDetails/StayDetailsContent"; 

export default function StayDetailsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Stay Details" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-24.jpg"
      />

      <StayDetailsContent />
 
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
