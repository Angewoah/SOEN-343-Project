import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/events/inactive")({
  component: RouteComponent,
});

function RouteComponent() {
  const events = useLoaderData({ from: "/organization/events" }) ?? [];

  const incompleteEvents = events.filter((event) => event.status != "active");
  return (
    <div className="mt-6 flex flex-col">
      <h1 className="font-medium text-2xl">
        Complete your events before publishing
      </h1>
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
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold">{event.title}</h2>

                  <p>{event.description}</p>
                  <p>Duration: {event.duration_minutes} minutes</p>
                  <p>Max Attendees: {event.max_attendees}</p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-48">
                  <Link
                    to="/organization/complete-event/$eventId"
                    params={{ eventId: `${event.id}` }}
                    className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center"
                  >
                    Complete event
                  </Link>
                  <Link
                    to="/organization/edit/$eventId"
                    params={{ eventId: `${event.id}` }}
                    className="font-medium text-center text-md text-black  hover:bg-neutral-100 p-2 rounded-lg transition-colors border-2 border-neutral-300"
                  >
                    Edit event details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
