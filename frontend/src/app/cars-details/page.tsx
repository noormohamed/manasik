import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import CarsDetailsContent from "@/components/CarsDetails/CarsDetailsContent";

export default function CarsDetailsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Cars Details" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-26.jpg"
      />

      <CarsDetailsContent />
 
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
