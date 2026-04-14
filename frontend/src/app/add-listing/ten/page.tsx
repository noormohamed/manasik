import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import CongratulationsThisIsYourListing from "@/components/AddListing/CongratulationsThisIsYourListing";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingTenPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <CongratulationsThisIsYourListing />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
