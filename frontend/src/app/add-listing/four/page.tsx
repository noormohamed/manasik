import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Amenities from "@/components/AddListing/Amenities";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingFourPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <Amenities />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
