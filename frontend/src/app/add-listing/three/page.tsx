import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import SizeOfYourLocation from "@/components/AddListing/SizeOfYourLocation";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingThreePage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <SizeOfYourLocation />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
