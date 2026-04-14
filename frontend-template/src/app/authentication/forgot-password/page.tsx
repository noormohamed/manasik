import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import Footer from "@/components/Layout/Footer";
import NewsletterForm from "@/components/Common/NewsletterForm";
import ForgotPassword from "@/components/Authentication/ForgotPassword";
 
export default function ForgotPasswordPage() {
  return (
    <>
      <NavbarStyleTwo />
      
      <PageBannerTitle 
        title="Forgot Password" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-19.jpg"
      />

      <ForgotPassword />
        
      <NewsletterForm />
    
      <Footer />
    </>
  )
}
