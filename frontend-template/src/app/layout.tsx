import "../../public/css/bootstrap.min.css";
import "../../public/css/remixicon.css";
import "../../public/css/flaticon.css";
import "../../public/css/header.css";
import "../../public/css/footer.css";
import "../../public/css/dark-switch-btn.css";
import 'swiper/css/bundle';
import 'react-accessible-accordion/dist/fancy-example.css';

import "../../public/css/globals.css";
import "../../public/css/responsive.css";
import '../../public/css/dark-mode.css'
import '../../public/css/rtl.css'

import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import BackToTop from "@/components/Layout/BackToTop";
import AosAnimation from "@/components/Layout/AosAnimation";
import RtlDemoSidebar from "@/components/Layout/RtlDemoSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manasik - Hotel Booking",
  description: "Leading Booking Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
              <BackToTop />
              <AosAnimation />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
