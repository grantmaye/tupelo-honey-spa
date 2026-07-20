import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking-flow";
import { getSquareBookingData } from "@/lib/square/catalog";
import { getSquareEnvironment, getSquareLocationId } from "@/lib/square/client";

export const metadata: Metadata = { title: "Book an Appointment", description: "Find a service, specialist, and appointment time at Tupelo Honey Spa." };
export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; provider?: string }> }) {
  const [params, square] = await Promise.all([searchParams, getSquareBookingData()]);
  const squareApplicationId = (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "").trim();
  const squareLocationId = getSquareLocationId();

  return <section className="min-h-screen bg-[#f6f5e9]"><BookingFlow initialService={params.service} initialProvider={params.provider} services={square.services} providers={square.providers} categories={square.categories} liveSquare={square.live} squareApplicationId={squareApplicationId} squareLocationId={squareLocationId} squareEnvironment={getSquareEnvironment()} /></section>;
}
