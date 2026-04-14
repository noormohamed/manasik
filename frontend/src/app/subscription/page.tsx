import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle"; 
import SubscriptionPackage from "@/components/Subscription/SubscriptionPackage";
import NewsletterForm from "@/components/Common/NewsletterForm";

export default function SubscriptionPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Subscription" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-20.jpg"
      />

     <SubscriptionPackage />

      <NewsletterForm />
  
      <Footer />
    </>
  )
}
