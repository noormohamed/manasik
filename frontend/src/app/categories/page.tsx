import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import BlogPost from "@/components/Categories/BlogPost";
  
export default function CategoriesPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Categories" 
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
