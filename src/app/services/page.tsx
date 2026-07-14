import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServiceExplorer } from "@/components/service-explorer";
import { getSquareBookingData } from "@/lib/square/catalog";

export const metadata: Metadata = { title: "Services", description: "Explore waxing, facials, massage, laser, Reiki, brows, lashes, and makeup at Tupelo Honey Spa." };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, square] = await Promise.all([searchParams, getSquareBookingData()]);
  return <><PageHero eyebrow="Our Services" title="The Tupelo Honey experience." copy="Explore the services you already know, now organized in a cleaner and easier way. Search by treatment or browse a category." /><ServiceExplorer initialCategory={category} categories={square.categories} services={square.services} /></>;
}
