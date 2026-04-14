import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import YouPlaceDescriptionForCustomer from "@/components/AddListing/YouPlaceDescriptionForCustomer";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingSixPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <YouPlaceDescriptionForCustomer />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
