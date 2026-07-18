import type { Availability, BookingProvider, BookingRequest, BookingResult } from "./types";
import { CANCELLATION_FEE_PERCENT, createBookingCardPolicyNote } from "./card-policy";
import { getSquareBookingData } from "@/lib/square/catalog";
import { getSquareLocationId, squareRequest } from "@/lib/square/client";

type SearchAvailabilityResponse = {
  availabilities?: Array<{
    start_at?: string;
    appointment_segments?: Array<{ team_member_id?: string }>;
  }>;
};

type Customer = { id?: string };
type SearchCustomersResponse = { customers?: Customer[] };
type CreateCustomerResponse = { customer?: Customer };
type CreateCardResponse = {
  card?: {
    id?: string;
    last_4?: string;
    card_brand?: string;
  };
};
type CreateBookingResponse = {
  booking?: {
    id?: string;
    start_at?: string;
    status?: string;
  };
};

export const squareBookingProvider: BookingProvider = {
  mode: "square",

  async getAvailability(serviceSlug, providerSlug): Promise<Availability[]> {
    const data = await getSquareBookingData();
    const service = data.services.find((item) => item.slug === serviceSlug);
    if (!data.live || !service?.squareVariationId) return [];

    const provider = providerSlug ? data.providers.find((item) => item.slug === providerSlug) : undefined;
    if (providerSlug && !provider?.squareId) return [];

    const start = new Date();
    start.setMinutes(start.getMinutes() + 5);
    const end = new Date(start);
    end.setDate(end.getDate() + 28);
    const segmentFilter: Record<string, unknown> = { service_variation_id: service.squareVariationId };
    if (provider?.squareId) segmentFilter.team_member_id_filter = { any: [provider.squareId] };

    const response = await squareRequest<SearchAvailabilityResponse>("/v2/bookings/availability/search", {
      method: "POST",
      body: JSON.stringify({
        query: {
          filter: {
            start_at_range: { start_at: start.toISOString(), end_at: end.toISOString() },
            location_id: getSquareLocationId(),
            segment_filters: [segmentFilter],
          },
        },
      }),
    });

    return (response.availabilities ?? []).flatMap((availability) => {
      if (!availability.start_at) return [];
      const providerId = availability.appointment_segments?.[0]?.team_member_id;
      return [{
        startAt: availability.start_at,
        providerId,
        label: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        }).format(new Date(availability.start_at)),
      }];
    }).slice(0, 120);
  },

  async createBooking(request: BookingRequest): Promise<BookingResult> {
    const data = await getSquareBookingData();
    if (!data.live) throw new Error("Live Square booking is temporarily unavailable.");

    const service = data.services.find((item) => item.slug === request.serviceSlug);
    const provider = data.providers.find((item) => item.squareId === request.providerId);
    if (!service?.squareVariationId || !service.squareVersion || !provider?.squareId) {
      throw new Error("That service or specialist is no longer available.");
    }
    if (request.providerSlug !== "any" && provider.slug !== request.providerSlug) {
      throw new Error("The selected specialist does not match this opening.");
    }
    if (!provider.serviceSlugs.includes(service.slug)) {
      throw new Error("The selected specialist does not offer this service.");
    }

    const stillAvailable = (await this.getAvailability(service.slug, provider.slug)).some((slot) =>
      slot.startAt === request.startAt && slot.providerId === provider.squareId,
    );
    if (!stillAvailable) throw new Error("That time was just booked. Please choose another opening.");

    const customerId = await findOrCreateCustomer(request);
    const cardResponse = await squareRequest<CreateCardResponse>("/v2/cards", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: `card-${request.idempotencyKey}`,
        source_id: request.cardSourceId,
        card: {
          customer_id: customerId,
          cardholder_name: `${request.customer.firstName} ${request.customer.lastName}`,
          reference_id: request.idempotencyKey,
        },
      }),
    });
    const card = cardResponse.card;
    if (!card?.id || !card.last_4) throw new Error("Square did not return a secured card confirmation.");
    const cardBrand = formatCardBrand(card.card_brand);
    const feeCents = service.priceAmountCents === undefined
      ? undefined
      : Math.round(service.priceAmountCents * CANCELLATION_FEE_PERCENT / 100);
    const policyNote = createBookingCardPolicyNote({
      cardId: card.id,
      feeCents,
      saveForFuture: request.saveCardForFuture,
      acceptedAt: new Date().toISOString(),
      cardBrand,
      last4: card.last_4,
    });

    try {
      const response = await squareRequest<CreateBookingResponse>("/v2/bookings", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: `booking-${request.idempotencyKey}`,
          booking: {
            location_id: getSquareLocationId(),
            customer_id: customerId,
            start_at: request.startAt,
            customer_note: request.note || undefined,
            seller_note: policyNote,
            appointment_segments: [{
              team_member_id: provider.squareId,
              service_variation_id: service.squareVariationId,
              service_variation_version: service.squareVersion,
            }],
          },
        }),
      });

      const booking = response.booking;
      if (!booking?.id || !booking.start_at) throw new Error("Square did not return a booking confirmation.");
      return {
        id: booking.id,
        status: "confirmed",
        startsAt: booking.start_at,
        securedCard: { brand: cardBrand, last4: card.last_4, savedForFuture: request.saveCardForFuture },
      };
    } catch (error) {
      await disableCardQuietly(card.id);
      throw error;
    }
  },
};

async function findOrCreateCustomer(request: BookingRequest) {
  const search = await squareRequest<SearchCustomersResponse>("/v2/customers/search", {
    method: "POST",
    body: JSON.stringify({
      limit: 1,
      query: { filter: { email_address: { exact: request.customer.email } } },
    }),
  });
  const existingId = search.customers?.[0]?.id;
  if (existingId) return existingId;

  const created = await squareRequest<CreateCustomerResponse>("/v2/customers", {
    method: "POST",
    body: JSON.stringify({
      idempotency_key: `customer-${request.idempotencyKey}`,
      given_name: request.customer.firstName,
      family_name: request.customer.lastName,
      email_address: request.customer.email,
      phone_number: normalizePhone(request.customer.phone),
      reference_id: `web-${request.idempotencyKey}`,
    }),
  });
  if (!created.customer?.id) throw new Error("Square could not create the customer record.");
  return created.customer.id;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  throw new Error("Enter a valid 10-digit US mobile number.");
}

async function disableCardQuietly(cardId: string) {
  try {
    await squareRequest(`/v2/cards/${encodeURIComponent(cardId)}/disable`, { method: "POST" });
  } catch {
    // The original booking error is more useful to the customer; cleanup is retried operationally if needed.
  }
}

function formatCardBrand(value?: string) {
  if (!value) return "Card";
  return value.toLowerCase().split("_").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}
