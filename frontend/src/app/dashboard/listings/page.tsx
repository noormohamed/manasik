"use client";

import Footer from "@/components/Layout/Footer";
import Navbar from "@/components/Layout/Navbar";
import DashboardListingContent from "@/components/Dashboard/DashboardListingContent";
import ManagementPageLayout from "@/components/ManagementPageLayout/ManagementPageLayout";

export default function DashboardPage() {
    return (
        <>
            <Navbar />

            <ManagementPageLayout>
                <DashboardListingContent />
            </ManagementPageLayout>

            <Footer />
        </>
    )
}
