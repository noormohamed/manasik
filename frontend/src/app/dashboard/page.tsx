import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import AuthorContent from "@/components/Dashboard/DashboardContent";
import Navbar from "@/components/Layout/Navbar";
import DashboardContent from "@/components/Dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <DashboardContent />

      <Footer />
    </>
  )
}
