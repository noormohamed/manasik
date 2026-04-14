import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import HowLongCanGuestsStay from "@/components/AddListing/HowLongCanGuestsStay";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingNinePage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <HowLongCanGuestsStay />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
