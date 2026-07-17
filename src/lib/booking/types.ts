export type BookingMode = "demo" | "square";
export type Availability = { startAt: string; label: string; providerId?: string };
export type BookingRequest = {
  serviceSlug: string;
  providerSlug: string;
  providerId: string;
  startAt: string;
  idempotencyKey: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  note?: string;
};
export type BookingResult = { id: string; status: "confirmed"; startsAt: string };

export interface BookingProvider {
  mode: BookingMode;
  getAvailability(serviceSlug: string, providerSlug?: string): Promise<Availability[]>;
  createBooking(request: BookingRequest): Promise<BookingResult>;
}
