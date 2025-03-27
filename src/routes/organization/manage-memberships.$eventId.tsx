import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useUser } from "../../hooks/useUser";
import { useEffect, useState } from "react";
import { fetchEventById, updateEvent } from "../../modules/event/service";
import { Database } from "../../supabase/types";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getSupabaseClient, supabase } from "../../supabase/client";
import {
  BookingWithDetails,
  fetchEventBookings,
} from "../../modules/booking/service";

type Event = Database["public"]["Tables"]["events"]["Row"];

export const Route = createFileRoute(
  "/organization/manage-memberships/$eventId"
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data, error } = await getSupabaseClient().auth.getUser();

    if (error || !data.user) {
      return [];
    }

    return fetchEventById(params.eventId);
  },
});

function RouteComponent() {
  const { user } = useUser();
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);

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

  const loadBookings = async () => {
    try {
      const fetchedBookings = await fetchEventBookings(eventIdNum);
      setBookings(fetchedBookings || []);
    } catch (error) {
      console.error("Error fetching bookings", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [eventId]);

  const confirmedBookings = bookings.filter(
    (booking) => booking.registration_status === "confirmed"
  );

  const pendingBookings = bookings.filter(
    (booking) => booking.registration_status !== "confirmed"
  );

  async function handleDeleteBooking(bookingId: number) {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      await loadBookings();
    } catch (error) {
      console.error("Error deleting booking", error);
    }
  }

  async function handleAcceptBooking(bookingId: number) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ registration_status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;

      await loadBookings();
    } catch (error) {
      console.error("Error accepting booking", error);
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
        <h1 className="text-lg font-mono ml-4">Manage Bookings</h1>
      </div>
      <div className="w-full px-72 mt-4">
        <h2 className="text-2xl font-medium mb-4">Pending</h2>
        <div className="w-full overflow-hidden rounded-lg shadow-lg">
          <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-300 text-white">
              <tr>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  User ID
                </th>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  Registration Status
                </th>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  Type
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingBookings.map((booking) => (
                <tr
                  key={booking.user_id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {booking.user_id}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-3 py-1 inline-block text-xs font-semibold rounded-full ${
                        booking.registration_status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.registration_status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{booking.type}</td>
                  <td>
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-green-600 font-medium text-white p-2 rounded-lg cursor-pointer"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-600 font-medium text-white p-2 rounded-lg cursor-pointer"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="text-2xl font-medium mb-4 mt-16">Confirmed</h2>
        <div className="w-full overflow-hidden rounded-lg shadow-lg">
          <table className="w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-300 text-white">
              <tr>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  User ID
                </th>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  Registration Status
                </th>
                <th className="p-4 text-left text-sm font-semibold uppercase">
                  Type
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {confirmedBookings.map((booking) => (
                <tr
                  key={booking.user_id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {booking.user_id}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-3 py-1 inline-block text-xs font-semibold rounded-full ${
                        booking.registration_status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.registration_status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{booking.type}</td>
                  <td>
                    <div className="flex gap-2 justify-center">
                      <button className="bg-red-600 font-medium text-white p-2 rounded-lg cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
