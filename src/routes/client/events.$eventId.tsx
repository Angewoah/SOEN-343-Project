import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchEventById } from "../../modules/event/service";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/client/events/$eventId")({
  component: EventDetailsComponent,
});

type Event = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  max_attendees: number;
  created_at: string;
  venue: {
    id: number;
    name: string;
    address: string;
    capacity: number;
  } | null;
  timeslot: {
    id: number;
    start_time: string;
    end_time: string;
  } | null;
};

function EventDetailsComponent() {
  const { eventId } = useParams({ from: "/client/events/$eventId" });
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError("No event ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching event with ID:", eventId);
        const data = await fetchEventById(eventId);
        
        if (!data) {
          setError(`Event with ID ${eventId} not found`);
          setEvent(null);
        } else {
          console.log("Fetched event data:", data);
          setEvent(data);
        }
      } catch (err) {
        console.error(`Failed to load event with ID ${eventId}:`, err);
        setError("Failed to load event details");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  // Format date function
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-gray-700">
          {error || "Event not found"}
        </h2>
        <p className="mt-2 text-gray-500">
          {error 
            ? "There was a problem loading this event." 
            : "The event you're looking for doesn't exist or has been removed."}
        </p>
        <Link 
          to="/client/events"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/client/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
          
          <button 
            className="text-gray-600 hover:text-gray-800"
            onClick={() => window.history.back()}
          >
            ✕
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Duration: {event.duration_minutes} minutes</span>
                </div>
                
                <div className="flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Maximum capacity: {event.max_attendees} attendees</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Time & Location</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 mr-3 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">When</p>
                    <p>{event.timeslot ? formatDate(event.timeslot.start_time) : "Not scheduled"}</p>
                  </div>
                </div>
                
                {event.venue && (
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 mr-3 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Where</p>
                      <p>{event.venue.name}</p>
                      <p className="text-gray-600">{event.venue.address}</p>
                      <p className="text-sm text-gray-500">Venue capacity: {event.venue.capacity}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full md:w-auto bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
              Book This Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}