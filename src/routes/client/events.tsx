import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchAllEventsWithDetails } from "../../modules/event/service";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Database } from "../../supabase/types";


export const Route = createFileRoute("/client/events")({
  component: ClientEventsComponent,
});

type Event = Database["public"]["Tables"]["events"]["Row"];

function ClientEventsComponent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Format date function
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="client-events">
      {/* This Outlet will render child routes like $eventId */}
      <Outlet />
      
      <h1 className="text-2xl font-bold mb-6">Available Events</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                  {event.timeslot ? formatDate(event.timeslot.start_time) : "Not scheduled"}
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
                  params={{ eventId: event.id }}
                  className="flex-1 flex justify-center items-center bg-gray-100 text-blue-600 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
                
                <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}