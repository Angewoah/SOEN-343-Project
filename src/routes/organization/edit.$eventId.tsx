import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useUser } from "../../hooks/useUser";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { fetchEventById, updateEvent } from "../../modules/event/service";
import { useEffect, useState } from "react";
import { Database } from "../../supabase/types";

type Event = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute("/organization/edit/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useUser();
  const { eventId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const eventIdNum = Number(eventId);

  useEffect(() => {
    async function loadEvent() {
      try {
        const fetchedEvent = await fetchEventById(eventId!);
        setEvent(fetchedEvent);
      } catch (error) {
        console.error(error);
      }
    }
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      setTitle(event.title ?? "");
      setDescription(event.description ?? "");
    }
  }, [event]);

  async function handleEventUpdate() {
    try {
      await updateEvent(eventIdNum, title, description);

      navigate({ to: "/organization/events/inactive" });
    } catch (error) {
      console.error("Beep", error);
    }
  }
  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-20 w-full flex bg-white items-center rounded-t-4xl border-b-1 border-b-neutral-200">
        <Link
          to="/organization/events/inactive"
          className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-mono ml-4">Edit Event</h1>
      </div>

      <div className="w-full max-w-1/4 py-16">
        <div className="flex flex-col gap-y-16">
          <div>
            <label
              htmlFor="title"
              className="block text-2xl font-bold text-gray-700"
            >
              Event Title
            </label>
            <input
              id="title"
              type="text"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:outline-blue-300"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-2xl font-bold text-gray-700"
            >
              Event Description
            </label>
            <textarea
              id="description"
              className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm focus:outline-blue-300"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <button
              type="button"
              className="w-full text-md font-medium bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none cursor-pointer"
              onClick={handleEventUpdate}
            >
              Update Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
