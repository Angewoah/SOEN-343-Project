import { useEffect, useState } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { fetchEvents } from "../../modules/event/service";
import { getSupabaseClient } from "../../supabase/client";
import { Sidebar } from "../../components/Sidebar";

export const Route = createFileRoute("/organization/insights")({
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = getSupabaseClient();
  const events = useLoaderData({ from: "/organization/events" }) ?? [];
  const [eventId, setEventId] = useState(null);
  const [attendeeList, setAttendeeList] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (eventId == null) {
      return;
    }
    const fetchAttendeeIdArr = async (eventId: number) => {
      const { data } = await supabase
        .from("bookings")
        .select("user_id")
        .eq("event_id", eventId);
      return data;
    };
    const fetchAttendee = async (attendeeId: number) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", attendeeId);
      return data;
    };
    const fetchAttendeeArr = async () => {
      const attendeeIdArr = await fetchAttendeeIdArr(eventId);
      const attendeesPromises = attendeeIdArr.map(async (attendee) => {
        const attendeeData = await fetchAttendee(attendee.user_id);
        return attendeeData[0];
      });

      const attendees = await Promise.all(attendeesPromises);
      setAttendeeList(attendees);
    };

    fetchAttendeeArr();
  }, [eventId]);

  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl mb-10">Insights</h1>
        <input
          type="number"
          placeholder="Enter event id"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            if (value !== "" && typeof +value === "number") {
              setEventId(value);
            }
            setQuery(value);
            return;
          }}
          className="w-full p-2 mb-4 border border-neutral-300 rounded-lg"
        />
        {attendeeList.length === 0 ? (
          <p>No registrations exist for this event</p>
        ) : (
          attendeeList.map((attendee) => (
            <div
              key={attendee.id}
              className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="text-xl font-bold">{attendee.name}</h2>
            </div>
          ))
        )}
      </div>
    </>
  );
}
