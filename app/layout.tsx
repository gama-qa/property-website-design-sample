import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ViewingModalProvider } from "@/components/property/ViewingModal";
import { LenisProvider } from "@/components/providers/LenisProvider";
import "./globals.css";

// Pluvix Luxury (Creativetacos), self-hosted from app/fonts. Regular only.
// Licence per the foundry page: free for personal and limited small-business use.
const pluvix = localFont({
  src: "./fonts/PluvixLuxury-Regular.otf",
  variable: "--font-pluvix",
  weight: "400",
  style: "normal",
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Halden Residences — Sewa rumah dan apartemen di Jakarta",
    template: "%s — Halden Residences",
  },
  description:
    "Rumah dan apartemen untuk disewa bulanan dan tahunan di Jakarta Selatan dan Jakarta Pusat. Proyek contoh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${pluvix.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">
        <LenisProvider>
          <ViewingModalProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ViewingModalProvider>
          <PageTransition />
          <Cursor />
        </LenisProvider>
      </body>
    </html>
  );
}
