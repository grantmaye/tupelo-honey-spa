import { NextRequest, NextResponse } from "next/server";
import { getBookingProvider } from "@/lib/booking/provider";
import type { BookingRequest } from "@/lib/booking/types";
import { SquareApiError } from "@/lib/square/client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const idempotencyPattern = /^[a-zA-Z0-9-]{16,64}$/;

export async function POST(request: NextRequest) {
  let body: Partial<BookingRequest>;
  try {
    body = await request.json() as Partial<BookingRequest>;
  } catch {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const firstName = body.customer?.firstName?.trim() ?? "";
  const lastName = body.customer?.lastName?.trim() ?? "";
  const email = body.customer?.email?.trim().toLowerCase() ?? "";
  const phone = body.customer?.phone?.trim() ?? "";
  const cardSourceId = body.cardSourceId?.trim() ?? "";
  const start = body.startAt ? new Date(body.startAt) : undefined;
  if (
    !body.serviceSlug || !body.providerSlug || !body.providerId || !body.startAt ||
    !body.idempotencyKey || !idempotencyPattern.test(body.idempotencyKey) ||
    !firstName || !lastName || firstName.length > 80 || lastName.length > 80 ||
    !emailPattern.test(email) || email.length > 254 || phone.replace(/\D/g, "").length < 10 ||
    !start || Number.isNaN(start.valueOf()) || start <= new Date() ||
    !cardSourceId || cardSourceId.length > 4096 || body.policyAccepted !== true ||
    typeof body.saveCardForFuture !== "boolean"
  ) {
    return NextResponse.json({ error: "Check the appointment and contact details, then try again." }, { status: 400 });
  }

  const bookingRequest: BookingRequest = {
    serviceSlug: body.serviceSlug,
    providerSlug: body.providerSlug,
    providerId: body.providerId,
    startAt: body.startAt,
    idempotencyKey: body.idempotencyKey,
    customer: { firstName, lastName, email, phone },
    note: body.note?.trim().slice(0, 500),
    cardSourceId,
    policyAccepted: true,
    saveCardForFuture: body.saveCardForFuture,
  };

  try {
    const bookingProvider = getBookingProvider();
    if (bookingProvider.mode === "demo") return NextResponse.json({ error: "Online booking is temporarily unavailable. Please call the spa." }, { status: 503 });
    const booking = await bookingProvider.createBooking(bookingRequest);
    return NextResponse.json({ booking }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const conflict = error instanceof SquareApiError && ["BOOKING_VERSION_MISMATCH", "INVALID_TIME", "TIME_RANGE_UNAVAILABLE"].includes(error.code ?? "");
    const cardError = error instanceof SquareApiError && ["CARD_DECLINED", "CVV_FAILURE", "ADDRESS_VERIFICATION_FAILURE", "INVALID_CARD_DATA", "SOURCE_EXPIRED", "SOURCE_USED", "VERIFY_CVV_FAILURE", "VERIFY_AVS_FAILURE"].includes(error.code ?? "");
    const message = conflict
      ? "That time is no longer available. Please choose another opening."
      : cardError
        ? "Your card could not be secured. Review the card details or try another card. Nothing was charged."
      : error instanceof Error ? error.message : "The appointment could not be created.";
    return NextResponse.json({ error: message }, { status: conflict ? 409 : 502 });
  }
}
