import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/organization/events/all")({
  component: RouteComponent,
});

function RouteComponent() {
  const events = useLoaderData({ from: "/organization/events" }) ?? [];

  const [searchText, setSearchText] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchText) return events;

    const lowercaseSearchText = searchText.toLowerCase();

    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(lowercaseSearchText) ||
        event.description?.toLowerCase().includes(lowercaseSearchText)
    );
  }, [searchText, events]);

  return (
    <div className="mt-6">
      <input
        type="text"
        placeholder="Search events..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2 mb-4 border border-neutral-300 rounded-lg"
      />
      {filteredEvents.length === 0 ? (
        <p>No events found</p>
      ) : (
        filteredEvents.map((event) => (
          <div
            key={event.id}
            className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
          >
            <h2 className="text-xl font-bold">{event.title}</h2>
            <p>{event.description}</p>
            <div className="flex justify-between mt-2">
              <span>Duration: {event.duration_minutes} minutes</span>
              <span>Max Attendees: {event.max_attendees}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
