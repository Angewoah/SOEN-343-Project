import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/events/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const events = useLoaderData({ from: "/organization/events" }) ?? [];

  const incompleteEvents = events.filter((event) => event.venue_id == null);
  return (
    <div className="mt-6 flex flex-col">
      <h1 className="font-medium text-2xl">Complete your events</h1>
      <div className="mt-6">
        {incompleteEvents.length === 0 ? (
          <p>No events found</p>
        ) : (
          incompleteEvents.map((event) => (
            <div
              key={event.id}
              className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">{event.title}</h2>
                <Link
                  to="/organization/complete-event/$eventId"
                  params={{ eventId: `${event.id}` }}
                  className="flex items-center font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                >
                  Complete event
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <p>{event.description}</p>
                <p>Duration: {event.duration_minutes} minutes</p>
                <p>Max Attendees: {event.max_attendees}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
