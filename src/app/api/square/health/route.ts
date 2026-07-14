import { NextResponse } from "next/server";
import {
  getSquareEnvironment,
  getSquareLocationId,
  isSquareConfigured,
  SquareApiError,
  squareRequest,
} from "@/lib/square/client";

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

export async function GET() {
  if (!isSquareConfigured()) {
    return NextResponse.json({ connected: false, error: "Square is not configured." }, { status: 503 });
  }

  try {
    const locationId = getSquareLocationId();
    const [locations, catalog, team] = await Promise.all([
      squareRequest<LocationsResponse>("/v2/locations"),
      squareRequest<CatalogResponse>("/v2/catalog/search", {
        method: "POST",
        body: JSON.stringify({ object_types: ["ITEM"], limit: 100 }),
      }),
      squareRequest<TeamProfilesResponse>(
        `/v2/bookings/team-member-booking-profiles?bookable_only=true&location_id=${encodeURIComponent(locationId)}`,
      ),
    ]);

    const configuredLocation = locations.locations?.find((location) => location.id === locationId);
    const appointmentServices = catalog.objects?.filter(
      (object) => object.item_data?.product_type === "APPOINTMENTS_SERVICE",
    ) ?? [];

    return NextResponse.json({
      connected: true,
      environment: getSquareEnvironment(),
      location: {
        configured: Boolean(configuredLocation),
        active: configuredLocation?.status === "ACTIVE",
      },
      catalog: {
        items: catalog.objects?.length ?? 0,
        appointmentServices: appointmentServices.length,
      },
      bookings: {
        bookableTeamMembers: team.team_member_booking_profiles?.length ?? 0,
      },
    });
  } catch (error) {
    const squareError = error instanceof SquareApiError ? error : undefined;
    return NextResponse.json({
      connected: false,
      error: squareError?.code ?? "SQUARE_CONNECTION_FAILED",
    }, { status: squareError?.status && squareError.status < 500 ? 400 : 502 });
  }
}
