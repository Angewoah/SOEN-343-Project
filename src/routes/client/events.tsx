import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
  useLoaderData,
} from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { fetchAllEventsWithDetails } from "../../modules/event/service";
import {
  fetchUserBookings,
  createBooking,
} from "../../modules/booking/service";
import { format } from "date-fns";
import { UserIcon } from "@heroicons/react/24/outline";
import { getSupabaseClient } from "../../supabase/client";
import EventCarousel, { scrollbarStyle } from "../../components/EventCarousel";
import { EventWithDetails } from "../../components/EventCard";

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

function ClientEventsComponent() {
  const loaderData = useLoaderData({ from: "/client/events" });
  const user = loaderData?.user;
  const userBookings = loaderData?.userBookings || [];

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);
  const matches = useMatches();
  const isEventDetailPage = matches.some(
    (match) => match.routeId === "/client/events/$eventId"
  );

  const userBookedEventIds = useMemo(() => {
    return new Set(userBookings?.map((booking) => booking.event_id) || []);
  }, [userBookings]);

  // First filter to only include active events
  const activeEvents = useMemo(() => {
    return events.filter(event => event.status === 'active');
  }, [events]);

  // Then filter out events the user has already booked
  const availableEvents = useMemo(() => {
    return activeEvents.filter((event) => !userBookedEventIds.has(event.id));
  }, [activeEvents, userBookedEventIds]);

  // Filter events by tag
  const educationalEvents = useMemo(() => {
    return availableEvents.filter(event => 
      event.tags?.includes('educational')
    );
  }, [availableEvents]);

  const entertainmentEvents = useMemo(() => {
    return availableEvents.filter(event => 
      event.tags?.includes('entertainment')
    );
  }, [availableEvents]);

  const networkingEvents = useMemo(() => {
    return availableEvents.filter(event => 
      event.tags?.includes('networking')
    );
  }, [availableEvents]);

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
      <style>{scrollbarStyle}</style>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover Events</h1>
          <p className="text-gray-600">Find and book events that interest you</p>
        </div>

        {user && (
          <div className="flex items-center mr-6 text-gray-600">
            <UserIcon className="w-5 h-5 mr-2" />
            <span>{user.email}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : availableEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {events.length === 0 ? (
            "No events available at the moment."
          ) : (
            <div>
              <p className="text-lg mb-2">You've booked all available events!</p>
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
        <>
          {/* For You - All Events */}
          {availableEvents.length > 0 ? (
            <EventCarousel
              title="For You"
              description="Events we think you might like"
              events={availableEvents}
              bookingInProgress={bookingInProgress}
              handleBookEvent={handleBookEvent}
              formatDate={formatDate}
              tagColor="bg-red-500"
            />
          ) : (
            <div className="mb-12 max-w-screen-xl mx-auto">
              <div className="flex items-center mb-4">
                <div className={`w-1 h-8 bg-red-500 mr-3`}></div>
                <div>
                  <h2 className="text-9xl font-bold">For You</h2>
                  <p className="text-sm text-gray-600">Events we think you might like</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No available events at the moment. Check back soon!</p>
              </div>
            </div>
          )}
          
          {/* Educational Events */}
          {educationalEvents.length > 0 ? (
            <EventCarousel
              title="Educational Events"
              description="Expand your knowledge and skills"
              events={educationalEvents}
              bookingInProgress={bookingInProgress}
              handleBookEvent={handleBookEvent}
              formatDate={formatDate}
              tagColor="bg-blue-500"
            />
          ) : (
            <div className="mb-12 max-w-screen-xl mx-auto">
              <div className="flex items-center mb-4">
                <div className={`w-1 h-8 bg-blue-500 mr-3`}></div>
                <div>
                  <h2 className="text-xl font-bold">Educational Events</h2>
                  <p className="text-sm text-gray-600">Expand your knowledge and skills</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No educational events currently available.</p>
              </div>
            </div>
          )}
          
          {/* Entertainment Events */}
          {entertainmentEvents.length > 0 ? (
            <EventCarousel
              title="Entertainment"
              description="Fun and enjoyable experiences"
              events={entertainmentEvents}
              bookingInProgress={bookingInProgress}
              handleBookEvent={handleBookEvent}
              formatDate={formatDate}
              tagColor="bg-purple-500"
            />
          ) : (
            <div className="mb-12 max-w-screen-xl mx-auto">
              <div className="flex items-center mb-4">
                <div className={`w-1 h-8 bg-purple-500 mr-3`}></div>
                <div>
                  <h2 className="text-xl font-bold">Entertainment</h2>
                  <p className="text-sm text-gray-600">Fun and enjoyable experiences</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No entertainment events currently available.</p>
              </div>
            </div>
          )}
          
          {/* Networking Events */}
          {networkingEvents.length > 0 ? (
            <EventCarousel
              title="Networking"
              description="Connect with others in your field"
              events={networkingEvents}
              bookingInProgress={bookingInProgress}
              handleBookEvent={handleBookEvent}
              formatDate={formatDate}
              tagColor="bg-green-500"
            />
          ) : (
            <div className="mb-12 max-w-screen-xl mx-auto">
              <div className="flex items-center mb-4">
                <div className={`w-1 h-8 bg-green-500 mr-3`}></div>
                <div>
                  <h2 className="text-xl font-bold">Networking</h2>
                  <p className="text-sm text-gray-600">Connect with others in your field</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No networking events currently available.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}