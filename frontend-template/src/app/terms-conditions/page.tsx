import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import TermsConditionsContent from "@/components/TermsConditions/TermsConditionsContent";
import NewsletterForm from "@/components/Common/NewsletterForm";

export default function TermsConditionsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Terms & Conditions" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-2.jpg"
      />

      <TermsConditionsContent />

      <NewsletterForm />
  
      <Footer />
    </>
  )
}
