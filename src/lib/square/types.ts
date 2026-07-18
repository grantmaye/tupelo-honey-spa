import type { Service, TeamMember } from "@/data/site";

export type SquareService = Service & {
  squareItemId: string;
  squareVariationId: string;
  squareVersion: number;
  priceAmountCents?: number;
  providerIds: string[];
};

export type SquareProvider = Pick<TeamMember, "slug" | "name" | "role" | "externalBooking"> & {
  squareId: string;
  serviceSlugs: string[];
};

export type SquareBookingData = {
  live: boolean;
  services: SquareService[];
  providers: SquareProvider[];
  categories: string[];
};
