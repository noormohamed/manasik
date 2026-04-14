import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import BlogDetailsContent from "@/components/Blog/BlogDetailsContent";
import NewsletterForm from "@/components/Common/NewsletterForm";

export default function BlogDetailsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Blog Details" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-23.jpg"
      />

      <BlogDetailsContent />

      <NewsletterForm />
 
      <Footer />
    </>
  )
}
