import { useAction, useQuery } from "convex/react";
import { PrimaryButton, SecondaryButton, TertiaryButton } from "../ui/CustomButton";
import { api } from "../../../convex/_generated/api";
import CalendarEventsList from "./CalendarEventList";

export default function Form() {
  const getFreeBusy = useAction(api.calendar.getFreeBusy);
  const getUserCalendar = useAction(api.calendar.getUserCalendars);
  const getCalendarEvents = useAction(api.calendar.getCalendarEvents)
  const user = useQuery(api.user.getCurrentUser, {})
  // function that calls freeBusy
  const handleGetFreeBusy = async () => {
    try {
      const id = user?._id;
      if (!id) throw new Error("Could Not Get The User!")
      const result = await getFreeBusy({ userId: id });

      console.log("FreeBusy result:", result);
      // TODO: handle the result (show in UI, save state, etc.)
    } catch (err) {
      console.error("Error fetching FreeBusy:", err);
    }
  };

  const handleGetMainCalendar = async () => {
    const id = user?._id;
    if (!id) throw new Error("Could Not Get The User!")
    const calendar = getUserCalendar({ userId: id })
  };

  const handleGetCalendarEvents = async () => {
    const id = user?._id;
    const calendarId = "shamiivan@gmail.com";
    if (!id) throw new Error("Could Not Get The User!")
    const events = getCalendarEvents({
      userId: id,
      calendarId: calendarId,
      timeMin: "2024-01-01T00:00:00Z",
      timeMax: "2024-01-31T23:59:59Z",
    })

    console.log("Events", events);

  }
  return (
    <div>
      <PrimaryButton onClick={handleGetFreeBusy}>
        Get FreeBusy
      </PrimaryButton>

      <SecondaryButton onClick={handleGetMainCalendar}> Get Main Calendar</SecondaryButton>

      <TertiaryButton onClick={handleGetCalendarEvents}> Get Calendar Event</TertiaryButton>
      <CalendarEventsList
        calendarId="shamiivan@gmail.com" // or "primary" / any calendar ID
        initialRange={{
          start: new Date("2025-08-01"),
          end: new Date("2025-08-31"),
        }}
        maxResults={250}
        singleEvents={true}
        autoFetch={true}
      />
    </div>
  );
}
