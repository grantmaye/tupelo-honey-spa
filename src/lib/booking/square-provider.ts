import type { Availability, BookingProvider } from "./types";
import { getSquareBookingData } from "@/lib/square/catalog";
import { getSquareLocationId, squareRequest } from "@/lib/square/client";

type SearchAvailabilityResponse = {
  availabilities?: Array<{
    start_at?: string;
    appointment_segments?: Array<{ team_member_id?: string }>;
  }>;
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

  async createBooking() {
    throw new Error("Live appointment creation is not enabled during preview.");
  },
};
