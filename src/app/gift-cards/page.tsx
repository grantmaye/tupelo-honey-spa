import type { Metadata } from "next";
import { GiftCardCheckout } from "@/components/gift-card-checkout";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Purchase a digital Tupelo Honey Spa gift card for yourself or someone special.",
};

export default function GiftCardsPage() {
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";

  return <GiftCardCheckout applicationId={applicationId} locationId={locationId} />;
}
