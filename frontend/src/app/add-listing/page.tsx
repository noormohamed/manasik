import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import ChoosingListingCategories from "@/components/AddListing/ChoosingListingCategories";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <ChoosingListingCategories />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
