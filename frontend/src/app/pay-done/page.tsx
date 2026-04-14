import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PayDoneContent from "@/components/PayDone/PayDoneContent";
  
export default function PayDonePage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Pay Done" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-16.jpg"
      />

      <PayDoneContent />
  
      <NewsletterForm />

      <Footer />
    </>
  )
}
