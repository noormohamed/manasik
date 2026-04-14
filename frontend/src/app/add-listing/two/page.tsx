import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import YourPlaceLocation from "@/components/AddListing/YourPlaceLocation";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingTwoPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <YourPlaceLocation />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
