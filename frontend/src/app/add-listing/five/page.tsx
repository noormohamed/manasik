import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import SetHouseRulesForYourGuests from "@/components/AddListing/SetHouseRulesForYourGuests";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingFivePage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <SetHouseRulesForYourGuests />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
