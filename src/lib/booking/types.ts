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
  cardSourceId: string;
  policyAccepted: true;
  saveCardForFuture: boolean;
};
export type BookingResult = {
  id: string;
  status: "confirmed";
  startsAt: string;
  securedCard: { brand: string; last4: string; savedForFuture: boolean };
};

export interface BookingProvider {
  mode: BookingMode;
  getAvailability(serviceSlug: string, providerSlug?: string): Promise<Availability[]>;
  createBooking(request: BookingRequest): Promise<BookingResult>;
}
