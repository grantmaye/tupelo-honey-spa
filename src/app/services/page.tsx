import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServiceExplorer } from "@/components/service-explorer";
import { getSquareBookingData } from "@/lib/square/catalog";
import { getWordPressServicesIntro } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Services", description: "Explore waxing, facials, massage, laser, Reiki, brows, lashes, and makeup at Tupelo Honey Spa." };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, square, intro] = await Promise.all([searchParams, getSquareBookingData(), getWordPressServicesIntro()]);
  return <><PageHero eyebrow="Our Services" title={intro.title} copy={intro.paragraphs.join(" ")} /><ServiceExplorer initialCategory={category} categories={square.categories} services={square.services} /></>;
}
