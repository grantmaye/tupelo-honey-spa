import { NextRequest, NextResponse } from "next/server";
import { CARD_ENFORCEMENT_DAYS, CANCELLATION_WINDOW_HOURS, parseBookingCardPolicyNote } from "@/lib/booking/card-policy";
import { getSquareLocationId, squareRequest } from "@/lib/square/client";

type SquareBooking = {
  id?: string;
  start_at?: string;
  updated_at?: string;
  status?: "PENDING" | "ACCEPTED" | "CANCELLED_BY_CUSTOMER" | "CANCELLED_BY_SELLER" | "DECLINED" | "NO_SHOW" | string;
  seller_note?: string;
};
type ListBookingsResponse = { bookings?: SquareBooking[]; cursor?: string };
type RetrieveCardResponse = { card?: { id?: string; enabled?: boolean } };

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const bookings = await listRelevantBookings(now);
  const cards = new Map<string, SquareBooking[]>();

  for (const booking of bookings) {
    const policy = parseBookingCardPolicyNote(booking.seller_note);
    if (!policy) continue;
    cards.set(policy.cardId, [...(cards.get(policy.cardId) ?? []), booking]);
  }

  let disabled = 0;
  let retained = 0;
  let alreadyDisabled = 0;
  const failures: Array<{ cardId: string; message: string }> = [];

  for (const [cardId, linkedBookings] of cards) {
    if (linkedBookings.some((booking) => shouldRetain(booking, now))) {
      retained += 1;
      continue;
    }

    try {
      const response = await squareRequest<RetrieveCardResponse>(`/v2/cards/${encodeURIComponent(cardId)}`);
      if (response.card?.enabled === false) {
        alreadyDisabled += 1;
        continue;
      }
      await squareRequest(`/v2/cards/${encodeURIComponent(cardId)}/disable`, { method: "POST" });
      disabled += 1;
    } catch (error) {
      failures.push({ cardId, message: error instanceof Error ? error.message : "Unknown Square error" });
    }
  }

  return NextResponse.json({ checkedBookings: bookings.length, trackedCards: cards.size, disabled, retained, alreadyDisabled, failures }, { status: failures.length ? 207 : 200 });
}

function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) return request.headers.get("authorization") === `Bearer ${secret}`;
  return request.headers.get("user-agent") === "vercel-cron/1.0";
}

async function listRelevantBookings(now: Date) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - CARD_ENFORCEMENT_DAYS - 1);
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 15);
  const bookings: SquareBooking[] = [];
  let cursor: string | undefined;

  do {
    const query = new URLSearchParams({
      location_id: getSquareLocationId(),
      start_at_min: start.toISOString(),
      start_at_max: end.toISOString(),
      limit: "100",
    });
    if (cursor) query.set("cursor", cursor);
    const response = await squareRequest<ListBookingsResponse>(`/v2/bookings?${query}`);
    bookings.push(...(response.bookings ?? []));
    cursor = response.cursor;
  } while (cursor);

  return bookings;
}

function shouldRetain(booking: SquareBooking, now: Date) {
  const policy = parseBookingCardPolicyNote(booking.seller_note);
  if (!policy) return false;
  if (policy.saveForFuture) return true;
  if (!booking.start_at) return true;

  if (booking.status === "CANCELLED_BY_SELLER" || booking.status === "DECLINED") return false;
  if (booking.status === "CANCELLED_BY_CUSTOMER") {
    if (!booking.updated_at) return true;
    const hoursBefore = (new Date(booking.start_at).valueOf() - new Date(booking.updated_at).valueOf()) / 3_600_000;
    if (hoursBefore >= CANCELLATION_WINDOW_HOURS) return false;
  }

  const enforcementEnds = new Date(booking.start_at);
  enforcementEnds.setUTCDate(enforcementEnds.getUTCDate() + CARD_ENFORCEMENT_DAYS);
  return now < enforcementEnds;
}
