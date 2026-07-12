import { NextRequest, NextResponse } from "next/server";
import { getBookingProvider } from "@/lib/booking/provider";

export async function GET(request: NextRequest) {
  const service = request.nextUrl.searchParams.get("service");
  const provider = request.nextUrl.searchParams.get("provider") ?? undefined;
  if (!service) return NextResponse.json({ error: "A service is required." }, { status: 400 });
  const bookingProvider = getBookingProvider();
  const availability = await bookingProvider.getAvailability(service, provider);
  return NextResponse.json({ mode: bookingProvider.mode, availability });
}
