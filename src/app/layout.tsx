import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://tupelohoneyspa.com"),
  title: { default: "Tupelo Honey Spa | Spa & Wellness Collective", template: "%s | Tupelo Honey Spa" },
  description: "A welcoming spa and wellness collective in Elma, NY offering waxing, facials, massage, brows, lashes, laser hair removal, Reiki, and makeup.",
  openGraph: { title: "Tupelo Honey Spa", description: "Come as you are. Leave feeling like yourself again.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
