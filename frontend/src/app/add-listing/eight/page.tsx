import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import PriceYourSpace from "@/components/AddListing/PriceYourSpace";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingEightPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <PriceYourSpace />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
