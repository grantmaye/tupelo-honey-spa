import { NextResponse } from "next/server";
import {
  getSquareEnvironment,
  getSquareLocationId,
  isSquareConfigured,
  SquareApiError,
  squareRequest,
} from "@/lib/square/client";
import { getSquareBookingData } from "@/lib/square/catalog";

type LocationsResponse = {
  locations?: Array<{ id?: string; status?: string }>;
};

type CatalogResponse = {
  objects?: Array<{ type?: string; item_data?: { product_type?: string } }>;
};

type TeamProfilesResponse = {
  team_member_booking_profiles?: Array<{ is_bookable?: boolean }>;
};

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  const squareError = error instanceof SquareApiError ? error : undefined;
  return {
    ok: false as const,
    status: squareError?.status ?? 502,
    error: squareError?.code ?? "SQUARE_CONNECTION_FAILED",
  };
}

export async function GET() {
  if (!isSquareConfigured()) {
    return NextResponse.json({ connected: false, error: "Square is not configured." }, { status: 503 });
  }

  const locationId = getSquareLocationId();
  const [locationsResult, catalogResult, teamResult] = await Promise.allSettled([
      squareRequest<LocationsResponse>("/v2/locations"),
      squareRequest<CatalogResponse>("/v2/catalog/search", {
        method: "POST",
        body: JSON.stringify({ object_types: ["ITEM"], limit: 100 }),
      }),
      squareRequest<TeamProfilesResponse>(
        `/v2/bookings/team-member-booking-profiles?bookable_only=true&location_id=${encodeURIComponent(locationId)}`,
      ),
  ]);

  const locations = locationsResult.status === "fulfilled" ? locationsResult.value : undefined;
  const catalog = catalogResult.status === "fulfilled" ? catalogResult.value : undefined;
  const team = teamResult.status === "fulfilled" ? teamResult.value : undefined;
  const configuredLocation = locations?.locations?.find((location) => location.id === locationId);
  const appointmentServices = catalog?.objects?.filter(
    (object) => object.item_data?.product_type === "APPOINTMENTS_SERVICE",
  ) ?? [];
  const connected = locationsResult.status === "fulfilled" && catalogResult.status === "fulfilled";
  const synced = connected ? await getSquareBookingData() : undefined;

  return NextResponse.json({
    connected,
    environment: getSquareEnvironment(),
    location: locations ? {
      ok: true,
      configured: Boolean(configuredLocation),
      active: configuredLocation?.status === "ACTIVE",
    } : failure(locationsResult.status === "rejected" ? locationsResult.reason : undefined),
    catalog: catalog ? {
      ok: true,
      items: catalog.objects?.length ?? 0,
      appointmentServices: appointmentServices.length,
    } : failure(catalogResult.status === "rejected" ? catalogResult.reason : undefined),
    bookings: team ? {
      ok: true,
      bookableTeamMembers: team.team_member_booking_profiles?.length ?? 0,
    } : failure(teamResult.status === "rejected" ? teamResult.reason : undefined),
    websiteSync: synced ? {
      live: synced.live,
      services: synced.services.length,
      providers: synced.providers.length,
      categories: synced.categories.length,
      servicesWithoutAssignedProviders: synced.services.filter((service) => !service.providerIds.length).length,
    } : undefined,
  }, { status: connected ? 200 : 502 });
}
