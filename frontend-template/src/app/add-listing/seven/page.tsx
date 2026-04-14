import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm"; 
import PicturesOfThePlace from "@/components/AddListing/PicturesOfThePlace";

export default function AddListingSevenPage() {
  return (
    <>
      <NavbarStyleTwo />

      <PageBannerTitle 
        title="Add Listing 7" 
        homeText="Home" 
        homeUrl="/" 
        image="/images/page-banner/page-banner-img-11.jpg"
      />

      <PicturesOfThePlace />
  
      <NewsletterForm />
  
      <Footer />
    </>
  )
}
