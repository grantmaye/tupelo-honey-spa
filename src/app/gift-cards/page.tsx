import type { Metadata } from "next";
import { GiftCardCheckout } from "@/components/gift-card-checkout";
import { getSquareEnvironment, getSquareLocationId } from "@/lib/square/client";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Purchase a digital Tupelo Honey Spa gift card for yourself or someone special.",
};

export default function GiftCardsPage() {
  const applicationId = (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "").trim();
  const locationId = getSquareLocationId();
  const environment = getSquareEnvironment();

  return <GiftCardCheckout applicationId={applicationId} locationId={locationId} environment={environment} />;
}
