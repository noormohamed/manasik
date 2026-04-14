import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import BlogPost from "@/components/Tags/BlogPost";
  
export default function TagsPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Tags" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-21.jpg"
      />

      <BlogPost />
  
      <NewsletterForm />

      <Footer />
    </>
  )
}
