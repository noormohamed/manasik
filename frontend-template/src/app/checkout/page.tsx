import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import CheckoutContent from "@/components/Checkout/CheckoutContent";
  
export default function CheckoutPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Checkout" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-15.jpg"
      />

      <CheckoutContent />

      <NewsletterForm />

      <Footer />
    </>
  )
}
