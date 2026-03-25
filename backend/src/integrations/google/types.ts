export interface GoogleCalendarEvent {
  calendarId: string;
  eventId: string;
  title: string;
  status: "confirmed" | "cancelled" | "tentative";
  updatedAt: string;
  startAt: string;
  endAt: string;
  timezone: string;
}
