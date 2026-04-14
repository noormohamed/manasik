import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle"; 
import GoogleMap from "@/components/ContactUs/GoogleMap";
import ContactUsForm from "@/components/ContactUs/ContactUsForm";
import NewsletterForm from "@/components/Common/NewsletterForm";

export default function ContactUsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Contact Us" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-22.jpg"
      />

      <GoogleMap />

      <ContactUsForm />

      <NewsletterForm />
 
      <Footer />
    </>
  )
}
