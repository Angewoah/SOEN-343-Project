import {
  createFileRoute,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";
import { useUser } from "../../hooks/useUser";
import { Sidebar } from "../../components/Sidebar";
import { fetchEvents } from "../../modules/event/service";
import { PlusIcon } from "@heroicons/react/24/solid";
import { EventsNav } from "../../components/EventsNav";

export const Route = createFileRoute("/organization/events")({
  component: RouteComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();

    if (error || !data.user) {
      return [];
    }

    return fetchEvents(data.user);
  },
});

function RouteComponent() {
  const supabase = getSupabaseClient();
  const events = useLoaderData({ from: "/organization/events" }) ?? [];

  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <div className="flex justify-between">
          <h1 className="text-4xl">Events</h1>
          <Link
            to="/organization/create-event"
            className="flex items-center font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-6 h-6 mr-1" /> New event
          </Link>
        </div>
        <EventsNav />
        <Outlet />
      </div>
    </>
  );
}
