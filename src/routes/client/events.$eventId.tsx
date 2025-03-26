import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchEventById } from "../../modules/event/service";
import { createBooking } from "../../modules/booking/service";
import { getSupabaseClient } from "../../supabase/client";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ArrowLeftIcon,
  TicketIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { Database } from "../../supabase/types";

export const Route = createFileRoute("/client/events/$eventId")({
  component: EventDetailsComponent,
});

type EventType = Database["public"]["Tables"]["events"]["Row"];
type VenueType = Database["public"]["Tables"]["venues"]["Row"];
type TimeslotType = Database["public"]["Tables"]["venue_timeslots"]["Row"];

type EventWithDetails = EventType & {
  venue?: VenueType | null;
  timeslot?: TimeslotType | null;
};

function EventDetailsComponent() {
  const { eventId } = useParams({ from: "/client/events/$eventId" });
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [user, setUser] = useState<any>(null);
  
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
        
        const data = await fetchEventById(eventId);
        
        if (!data) {
          setError(`Event with ID ${eventId} not found`);
          setEvent(null);
        } else {
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

  // Get current user
  useEffect(() => {
    async function loadUser() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
      }
    }

    loadUser();
  }, []);

  // Format date function
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    
    try {
      return format(new Date(dateStr), "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (e) {
      return "TBD";
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    
    try {
      return format(new Date(dateStr), "h:mm a");
    } catch (e) {
      return "TBD";
    }
  };

  const handleBookEvent = async () => {
    if (!event || !user) {
      return;
    }

    try {
      setBookingInProgress(true);
      
      await createBooking({
        user_id: user.id,
        event_id: Number(eventId),
        status: "pending"
      });
      
      navigate({ to: "/client/events" });
    } catch (error) {
      console.error("Error booking event:", error);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-500">Loading event...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Event not found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error 
              ? "There was a problem loading this event." 
              : "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link 
            to="/client/events"
            className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Link 
            to="/client/events"
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
        </div>
      </div>

      {/* large header section */}
      <div className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8">
            {/* enter event image */}
            <div className="md:w-1/3">
              <div className="bg-white/10 rounded-lg aspect-[3/2] flex items-center justify-center">

                <div className="text-center p-8">
                  <p className="mt-4 text-white/80 font-medium">Event Image</p>
                </div>

              </div>
            </div>
            
            {/* Event Details */}
            <div className="md:w-2/3">
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    {event.title}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-2 text-white/90 font-bold">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="text-lg">{event.timeslot ? formatDate(event.timeslot.start_time ?? undefined) : "Date to be announced"}</span>
                </div>
                
                {event.venue && (
                  <div className="flex items-center space-x-2 text-white/90 font-bold">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="text-lg">{event.venue.name}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 pt-3">
                  <div className="bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                    {event.duration_minutes} minutes
                  </div>
                  <div className="bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                    {event.max_attendees} max attendees
                  </div>
                  <div className="bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                    Event
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column */}
            <div className="md:w-2/3 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                </div>
              </div>
              
              {/* Venue Section */}
              {event.venue && (
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Venue Information</h2>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-1/2 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.venue.name}</h3>
                      <p className="text-gray-600">{event.venue.address}</p>
                      <p className="text-gray-600 mt-1">Capacity: {event.venue.capacity} people</p>
                      

                        <p className="text-gray-700 mt-4">venue description</p>

                    </div>
                    
                    <div className="sm:w-1/2 flex-1 bg-gray-100 rounded-lg min-h-[200px] flex items-center justify-center">
                      {/* enter venue pic here*/}
                      <div className="text-center text-gray-500">
                        <p className="mt-2">Venue Location</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Booking Card */}
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* ticket details header */}
                  <div className="bg-gradient-to-r from-sky-300 to-indigo-400 text-white p-4">
                    <h3 className="text-xl font-bold">Book Your Spot</h3>
                    <p className="text-sm text-blue-100 mt-1">Secure your attendance today</p>
                  </div>
                  
                  {/* ticket details */}
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-gray-500 font-medium">Date</div>
                      <div className="text-gray-800 font-semibold">
                        {event.timeslot ? formatShortDate(event.timeslot.start_time ?? undefined) : "TBD"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-gray-500 font-medium">Time</div>
                      <div className="text-gray-800 font-semibold">
                        {event.timeslot ? formatTime(event.timeslot.start_time ?? undefined) : "TBD"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-gray-500 font-medium">Duration</div>
                      <div className="text-gray-800 font-semibold">{event.duration_minutes} minutes</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-500 font-medium">Location</div>
                      <div className="text-gray-800 font-semibold">{event.venue?.name || "TBD"}</div>
                    </div>
                  </div>
                  
                  {/* Booking options */}
                  <div className="p-5">
                    {!user ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md flex items-start">
                          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="ml-2">
                            <p className="text-blue-700 font-medium">Login Required</p>
                            <p className="text-blue-600 text-sm mt-1">
                              Please log in to book this event.
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          className="w-full bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                          onClick={() => navigate({ to: "/login", search: { returnTo: window.location.pathname } })}
                        >
                          Log In to Book
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="w-full bg-gradient-to-r from-sky-300 to-indigo-400 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed hover:cursor-pointer hover:text-black"
                        onClick={handleBookEvent}
                        disabled={bookingInProgress}
                      >
                        {bookingInProgress ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          "Book Now"
                        )}
                      </button>
                    )}
                    
                    {/* benefits */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="ml-2 text-gray-600 text-sm">Secure your spot with instant confirmation</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="ml-2 text-gray-600 text-sm">Receive event updates and important information</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="ml-2 text-gray-600 text-sm">Easy management of your bookings</p>
                      </div>
                    </div>
                    
                    {/* support note */}
                    <div className="mt-6 bg-blue-50 p-3 rounded-md flex items-start">
                      <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-2 text-blue-700 text-sm">Need help? Contact our support team for assistance with your booking.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}