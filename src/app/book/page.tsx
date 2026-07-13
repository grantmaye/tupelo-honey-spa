import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking-flow";

export const metadata: Metadata = { title: "Book an Appointment", description: "Find a service, specialist, and appointment time at Tupelo Honey Spa." };
export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; provider?: string }> }) { const params = await searchParams; return <section className="min-h-screen bg-[#f6f5e9]"><BookingFlow initialService={params.service} initialProvider={params.provider} /></section>; }
