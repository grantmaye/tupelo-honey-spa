export const CANCELLATION_WINDOW_HOURS = 24;
export const CANCELLATION_FEE_PERCENT = 50;
export const CARD_ENFORCEMENT_DAYS = 14;

const markerPattern = /\[M1-BOOKING-CARD\]([\s\S]*?)\[\/M1-BOOKING-CARD\]/;

export type BookingCardPolicy = {
  cardId: string;
  feeCents?: number;
  saveForFuture: boolean;
  acceptedAt: string;
  cardBrand: string;
  last4: string;
};

export function createBookingCardPolicyNote(policy: BookingCardPolicy) {
  const fee = policy.feeCents === undefined ? "50% of scheduled service price" : formatMoney(policy.feeCents);
  return [
    "Website card security policy",
    `Card: ${policy.cardBrand} ending in ${policy.last4}`,
    `Late cancellation/no-show fee: ${fee}`,
    `Cancellation window: ${CANCELLATION_WINDOW_HOURS} hours`,
    `Customer opted to save for future visits: ${policy.saveForFuture ? "Yes" : "No"}`,
    `Policy accepted: ${policy.acceptedAt}`,
    "[M1-BOOKING-CARD]",
    `card_id=${encodeURIComponent(policy.cardId)}`,
    `fee_cents=${policy.feeCents ?? "variable"}`,
    `save_for_future=${policy.saveForFuture ? "1" : "0"}`,
    `accepted_at=${policy.acceptedAt}`,
    `brand=${encodeURIComponent(policy.cardBrand)}`,
    `last4=${policy.last4}`,
    "[/M1-BOOKING-CARD]",
  ].join("\n");
}

export function parseBookingCardPolicyNote(note?: string): BookingCardPolicy | undefined {
  const marker = note?.match(markerPattern)?.[1];
  if (!marker) return undefined;
  const fields = new Map(marker.trim().split("\n").map((line) => {
    const separator = line.indexOf("=");
    return separator > 0 ? [line.slice(0, separator), line.slice(separator + 1)] : [line, ""];
  }));
  const cardId = decodeURIComponent(fields.get("card_id") ?? "");
  const acceptedAt = fields.get("accepted_at") ?? "";
  const last4 = fields.get("last4") ?? "";
  if (!cardId || !acceptedAt || !/^\d{4}$/.test(last4)) return undefined;
  const feeValue = fields.get("fee_cents");
  const feeCents = feeValue && /^\d+$/.test(feeValue) ? Number(feeValue) : undefined;
  return {
    cardId,
    feeCents,
    saveForFuture: fields.get("save_for_future") === "1",
    acceptedAt,
    cardBrand: decodeURIComponent(fields.get("brand") ?? "Card"),
    last4,
  };
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
