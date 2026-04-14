import Footer from "@/components/Layout/Footer";
import Navbar from "@/components/Layout/Navbar";
import DashboardListingContent from "@/components/Dashboard/DashboardListingContent";

export default function DashboardPage() {
    return (
        <>
            <Navbar />

            <DashboardListingContent />

            <Footer />
        </>
    )
}
