import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import PicturesOfThePlace from "@/components/AddListing/PicturesOfThePlace";
import ListingWizardLayout from "@/components/AddListing/ListingWizardLayout";

export default function AddListingSevenPage() {
  return (
    <>
      <Navbar />
      <ListingWizardLayout>
        <PicturesOfThePlace />
      </ListingWizardLayout>
      <Footer />
    </>
  )
}
