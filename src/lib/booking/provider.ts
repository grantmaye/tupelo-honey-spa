import { mockBookingProvider } from "./mock-provider";
import type { BookingProvider } from "./types";

export function getBookingProvider(): BookingProvider {
  // Square will be initialized lazily here once production credentials are available.
  // Keeping the provider behind this interface prevents Square-specific IDs and logic
  // from leaking into UI components.
  return mockBookingProvider;
}
