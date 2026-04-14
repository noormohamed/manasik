import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import ExperiencesDetailsContent from "@/components/ExperiencesDetails/ExperiencesDetailsContent";

export default function ExperiencesDetailsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Experiences Details" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-25.jpg"
      />

      <ExperiencesDetailsContent />
 
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
