import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServiceExplorer } from "@/components/service-explorer";

export const metadata: Metadata = { title: "Services", description: "Explore waxing, facials, massage, laser, Reiki, brows, lashes, and makeup at Tupelo Honey Spa." };
export default function ServicesPage() { return <><PageHero eyebrow="Our services" title="Take what you need." copy="From a ten-minute reset to an afternoon of care, find the treatment that fits your body, your goals, and your day." /><ServiceExplorer /></>; }
