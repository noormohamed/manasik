import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import PrivacyPolicyContent from "@/components/PrivacyPolicy/PrivacyPolicyContent";
import NewsletterForm from "@/components/Common/NewsletterForm";

export default function PrivacyPolicyPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Privacy Policy" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-1.jpg"
      />

      <PrivacyPolicyContent />

      <NewsletterForm />
  
      <Footer />
    </>
  )
}
