import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/events")({
  component: RouteComponent,
  // loader: () => fetchEvents(),
});

function RouteComponent() {
  return (
    <div className="w-full flex flex-col px-72 py-4">
      <h1 className="text-4xl ">Events</h1>
    </div>
  );
}
