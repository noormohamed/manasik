import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import AuthorContent from "@/components/Author/AuthorContent";
  
export default function AuthorPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Author" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-17.jpg"
      />

      <AuthorContent />
  
      <NewsletterForm />

      <Footer />
    </>
  )
}
