import type { Availability, BookingProvider, BookingRequest, BookingResult } from "./types";

function nextOpenDays() {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < 7) { cursor.setDate(cursor.getDate() + 1); if (cursor.getDay() !== 0) days.push(new Date(cursor)); }
  return days;
}

export const mockBookingProvider: BookingProvider = {
  mode: "demo",
  async getAvailability(): Promise<Availability[]> {
    const times = ["09:30", "11:00", "13:30", "15:00", "17:30"];
    return nextOpenDays().flatMap((day, dayIndex) => times.filter((_, index) => (dayIndex + index) % 3 !== 0).map((time) => {
      const [hours, minutes] = time.split(":").map(Number); const value = new Date(day); value.setHours(hours, minutes);
      return { startAt: value.toISOString(), label: value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
    }));
  },
  async createBooking(request: BookingRequest): Promise<BookingResult> {
    return { id: `DEMO-${Date.now().toString(36).toUpperCase()}`, status: "confirmed", startsAt: request.startAt };
  },
};
