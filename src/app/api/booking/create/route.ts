import { NextRequest, NextResponse } from "next/server";
import { getBookingProvider } from "@/lib/booking/provider";
import type { BookingRequest } from "@/lib/booking/types";

export async function POST(request: NextRequest) {
  const body = await request.json() as Partial<BookingRequest>;
  if (!body.serviceSlug || !body.providerSlug || !body.startAt || !body.customer?.email || !body.customer.phone) return NextResponse.json({ error: "Missing required booking details." }, { status: 400 });
  const bookingProvider = getBookingProvider();
  if (bookingProvider.mode === "demo") return NextResponse.json({ error: "Demo mode does not create live appointments." }, { status: 409 });
  const booking = await bookingProvider.createBooking(body as BookingRequest);
  return NextResponse.json({ booking });
}
