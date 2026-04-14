import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import AccountContent from "@/components/account/AccountContent";
  
export default function AccountPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Account" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-18.jpg"
      />

      <AccountContent />
  
      <NewsletterForm />

      <Footer />
    </>
  )
}
