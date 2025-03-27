import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { fetchAllEventsWithDetails } from "../../modules/event/service";
import {
  fetchUserBookings,
  createBooking,
} from "../../modules/booking/service";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Database } from "../../supabase/types";
import { getSupabaseClient } from "../../supabase/client";

export const Route = createFileRoute("/client/events")({
  component: ClientEventsComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return { user: null, userBookings: [] };
    }

    if (data.user) {
      try {
        const bookings = await fetchUserBookings(data.user.id);
        return { user: data.user, userBookings: bookings };
      } catch (err) {
        console.error("Error fetching user bookings:", err);
        return { user: data.user, userBookings: [] };
      }
    }

    return { user: data.user, userBookings: [] };
  },
});

type EventType = Database["public"]["Tables"]["events"]["Row"];
type VenueType = Database["public"]["Tables"]["venues"]["Row"];
type TimeslotType = Database["public"]["Tables"]["venue_timeslots"]["Row"];

type EventWithDetails = EventType & {
  venue?: VenueType | null;
  timeslot?: TimeslotType | null;
};

function ClientEventsComponent() {
  const loaderData = useLoaderData({ from: "/client/events" });
  const user = loaderData?.user;
  const userBookings = loaderData?.userBookings || [];

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(
    null
  );
  const matches = useMatches();
  const isEventDetailPage = matches.some(
    (match) => match.routeId === "/client/events/$eventId"
  );

  const userBookedEventIds = useMemo(() => {
    return new Set(userBookings?.map((booking) => booking.event_id) || []);
  }, [userBookings]);

  const availableEvents = useMemo(() => {
    return events.filter((event) => !userBookedEventIds.has(event.id));
  }, [events, userBookedEventIds]);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await fetchAllEventsWithDetails();
        setEvents(data || []);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";

    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleBookEvent = async (eventId: number) => {
    if (!user) {
      //alert("Please log in to book an event");
      return;
    }

    try {
      setBookingInProgress(eventId);

      await createBooking({
        user_id: user.id,
        event_id: eventId,
        status: "pending",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error booking event:", error);
    } finally {
      setBookingInProgress(null);
    }
  };

  if (isEventDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="client-events">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Events</h1>

        {user && (
          <div className="flex items-center mr-6 text-gray-600">
            <UserIcon className="w-5 h-5 mr-2" />
            <span>{user.email}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : availableEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {events.length === 0 ? (
            "No events available at the moment."
          ) : (
            <div>
              <p>You've booked all available events!</p>
              <Link
                to="/client/bookings"
                className="mt-3 inline-block text-blue-500 hover:text-blue-700 font-medium"
              >
                View your bookings
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2">
                {event.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                  {event.timeslot && event.timeslot.start_time
                    ? formatDate(event.timeslot.start_time)
                    : "Not scheduled"}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-2 text-blue-500" />
                  {event.venue ? event.venue.name : "No venue specified"}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
                  {event.duration_minutes} minutes
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-4 h-4 mr-2 text-blue-500" />
                  Max: {event.max_attendees} attendees
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-2">
                <Link
                  to="/client/events/$eventId"
                  params={{ eventId: String(event.id) }}
                  className="flex-1 flex justify-center items-center bg-gray-100 text-blue-600 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>

                <button
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={bookingInProgress === event.id}
                  onClick={() => handleBookEvent(event.id)}
                >
                  {bookingInProgress === event.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
