export type GoogleCalendarEvent = {
  kind: string;
  etag: string;
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  created: string;
  updated: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  organizer: {
    id?: string;
    email: string;
    displayName?: string;
    self?: boolean;
  };
  start: {
    date?: string; // For all-day events (YYYY-MM-DD)
    dateTime?: string; // For timed events (RFC3339)
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  endTimeUnspecified?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  transparency?: "opaque" | "transparent";
  visibility?: "default" | "public" | "private" | "confidential";
  iCalUID: string;
  sequence: number;
  attendees?: Array<{
    id?: string;
    email: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
    resource?: boolean;
    optional?: boolean;
    responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
    comment?: string;
    additionalGuests?: number;
  }>;
  attendeesOmitted?: boolean;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  hangoutLink?: string;
  conferenceData?: {
    createRequest?: any;
    entryPoints?: any[];
    conferenceSolution?: any;
    conferenceId?: string;
    signature?: string;
    notes?: string;
  };
  gadget?: any;
  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  source?: {
    url: string;
    title: string;
  };
  workingLocationProperties?: any;
  outOfOfficeProperties?: any;
  focusTimeProperties?: any;
};

export type CalendarEventsResponse = {
  kind: string;
  etag: string;
  summary: string;
  description?: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: Array<{
    method: string;
    minutes: number;
  }>;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarEvent[];
};
