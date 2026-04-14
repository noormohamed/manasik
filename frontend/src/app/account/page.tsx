import NavbarStyleTwo from "@/components/Layout/NavbarStyleTwo";
import Footer from "@/components/Layout/Footer";
import PageBannerTitle from "@/components/Common/PageBannerTitle";
import NewsletterForm from "@/components/Common/NewsletterForm";
import AccountContent from "@/components/account/AccountContent";
import Navbar from "@/components/Layout/Navbar";

export default function AccountPage() {
  return (
    <>
      <Navbar />

      <AccountContent />

      <Footer />
    </>
  )
}
