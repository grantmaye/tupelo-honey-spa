import { mockBookingProvider } from "./mock-provider";
import { squareBookingProvider } from "./square-provider";
import type { BookingProvider } from "./types";
import { isSquareConfigured } from "@/lib/square/client";

export function getBookingProvider(): BookingProvider {
  return isSquareConfigured() ? squareBookingProvider : mockBookingProvider;
}
