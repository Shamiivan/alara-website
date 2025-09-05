// integrations/google/calendar.ts
import { CalendarListResponse, CalendarEventsResponse, CalendarEventsOptions } from "./types";

export async function fetchCalendars(accessToken: string): Promise<CalendarListResponse> {
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API error: ${response.status} - ${errorText}`);
    }

    return await response.json() as CalendarListResponse;
  } catch (error) {
    throw new Error(`Failed to fetch user calendars: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  options: CalendarEventsOptions = {}
): Promise<CalendarEventsResponse> {
  try {
    const {
      timeMin,
      timeMax,
      maxResults = 250,
      singleEvents = true,
    } = options;

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      singleEvents: singleEvents.toString(),
      orderBy: "startTime",
    });

    if (timeMin) params.append("timeMin", timeMin);
    if (timeMax) params.append("timeMax", timeMax);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar Events API error: ${response.status} - ${errorText}`);
    }

    return await response.json() as CalendarEventsResponse;
  } catch (error) {
    throw new Error(`Failed to fetch calendar events for ${calendarId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}