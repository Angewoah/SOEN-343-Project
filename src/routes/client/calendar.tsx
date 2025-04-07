import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parse,
  getDay,
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BookingWithDetails,
  fetchConfirmedBookings,
} from "../../modules/booking/service";
import { useUser } from "../../hooks/useUser";

export const Route = createFileRoute("/client/calendar")({
  component: CalendarComponent,
});

function CalendarComponent() {
  const { user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<BookingWithDetails | null>(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });


  const safeParseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (e) {
      console.warn("Failed to parse date:", dateStr, e);
      return null;
    }
  };

  // Fetch bookings whenever user changes or retry is triggered
  useEffect(() => {
    if (!user) return;

    async function loadBookings() {
      setLoading(true);
      setError(null);

      try {
        console.log(
          `Attempting to load bookings (attempt ${retryCount + 1})...`
        );

        // Use the service function to fetch bookings
        const validBookings = await fetchConfirmedBookings(user!.id);

        console.log(`Received ${validBookings.length} valid bookings`);

        if (validBookings.length > 0) {
          // Check if we can parse the dates
          validBookings.forEach((booking) => {
            const date = safeParseDate(booking.event?.timeslot?.start_time);
            if (date) {
              console.log(
                `Booking ${booking.id} date parsed successfully: ${date.toISOString()}`
              );
            } else {
              console.warn(
                `Booking ${booking.id} has invalid date format: ${booking.event?.timeslot?.start_time}`
              );
            }
          });
        }

        setBookings(validBookings);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setError(
          `Failed to load your bookings: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [user, retryCount]);

  // Debug logging for bookings data
  useEffect(() => {
    if (bookings.length > 0) {
      console.log(`Calendar now has ${bookings.length} bookings to display`);
    }
  }, [bookings]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Format date for display
  const formatBookingDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";

    const date = safeParseDate(dateStr);
    if (!date) return "Invalid date";

    try {
      return format(date, "h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Improved getEventsForDay with safer date handling
  const getEventsForDay = (day: Date) => {
    try {
      return bookings.filter((booking) => {
        if (!booking.event?.timeslot?.start_time) {
          return false;
        }

        const eventDate = safeParseDate(booking.event.timeslot.start_time);
        return eventDate ? isSameDay(eventDate, day) : false;
      });
    } catch (error) {
      console.error("Error filtering events for day:", error);
      return [];
    }
  };

  const handleEventClick = (e: React.MouseEvent, booking: BookingWithDetails) => {
    e.stopPropagation(); 
  
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    setClickPosition({ 
      x: rect.right, 
      y: rect.top    
    });
    
    setSelectedEvent(booking);
  };

  const EventPopup = () => {
    if (!selectedEvent) return null;
  
    const [isVisible, setIsVisible] = useState(false);
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        // Trigger fade out animation before closing
        setIsVisible(false);
        setTimeout(() => {
          setSelectedEvent(null);
        }, 300); // Match this with animation duration
      }
    };

  const popupRef = useRef<HTMLDivElement>(null);
  
  const initialPosition = {
    top: Math.min(clickPosition.y - 10, window.innerHeight - 400),
    left: Math.min(clickPosition.x + 10, window.innerWidth - 420),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute inset-0 z-40 transition-opacity duration-300 `}
      style={{ top: `${window.scrollY}px`, height: '100vh' }}
      onClick={handleBackdropClick}
    >
      <div 
        ref={popupRef}
        style={{
          position: 'absolute',
          top: `${initialPosition.top}px`,
          left: `${initialPosition.left}px`,
          maxWidth: '400px',
          maxHeight: '80vh',
          zIndex: 50,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
        className="bg-blue-50 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-4 bg-gradient-to-r from-sky-300 to-indigo-400">
          <h3 className="text-lg font-semibold text-white">
            {selectedEvent.event?.title || "Event Details"}
          </h3>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => setSelectedEvent(null), 300);
            }}
            className="text-white"
          >
            <svg className="w-8 h-8 hover:cursor-pointer hover:rounded-4xl hover:bg-indigo-300 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        
        <div className="p-4 py-8">
          <div className="flex flex-col md:flex-row md:space-x-4">
            {/* Left Column */}
            <div className="md:w-1/2 space-y-4">
              <div className="flex items-start">
                <ClockIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  {selectedEvent.event?.timeslot ? (
                    <p className="font-medium">
                      {formatBookingDate(selectedEvent.event.timeslot.start_time || "")}
                    </p>
                  ) : (
                    <p className="text-gray-500">Not scheduled</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {selectedEvent.event?.duration_minutes} minutes
                  </p>
                </div>
              </div>
            </div>
        
            {/* Right Column */}
            <div className="md:w-1/2 space-y-4">
              {selectedEvent.event?.venue && (
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedEvent.event.venue.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedEvent.event.venue.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
  };

  // Generate the days for the current month view
  const monthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(startDate);

    // Create an array for the empty cells before the first day of the month
    const blanks = Array(startDay).fill(null);

    return (
      <div>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, dateFormat)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center py-2 font-medium text-sm text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the start of the month */}
          {blanks.map((_, index) => (
            <div
              key={`blank-${index}`}
              className="h-24 md:h-32 bg-gray-50 rounded-lg"
            ></div>
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const eventsForDay = getEventsForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`relative h-24 md:h-32 p-1 border rounded-lg overflow-hidden hover:bg-gray-50 ${
                  isSelected
                    ? "bg-blue-50 border-blue-200"
                    : isToday
                      ? "border-blue-300"
                      : "border-gray-200"
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-right p-1">
                  <span
                    className={`inline-block rounded-full w-6 h-6 text-center leading-6 ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isToday
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="overflow-y-auto max-h-20 mt-1">
                  {eventsForDay.length > 0
                    ? eventsForDay.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-1 mb-1 text-xs bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                          title={booking.event?.title || "Unnamed Event"}
                          onClick={(e) => handleEventClick(e, booking)}
                        >
                          {formatBookingDate(
                            booking.event?.timeslot?.start_time || ""
                          )}{" "}
                          {booking.event?.title || "Event"}
                        </div>
                      ))
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your booking calendar.
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            onClick={() => (window.location.href = "/login")}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My Booking Calendar
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading your bookings...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="ml-2">
                <div className="font-semibold">Error loading your bookings</div>
                <p>{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRetryCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <CalendarIcon className="w-16 h-16 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Confirmed Bookings Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You don't have any confirmed bookings yet. Once you book and
              confirm events, they will appear on your calendar.
            </p>
            <button
              onClick={() => (window.location.href = "/client/events")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* Information banner */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-4 flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-blue-700 text-sm">
              Your calendar shows all confirmed bookings. Events will appear on
              their scheduled dates.
            </p>
          </div>

          {monthDays()}

          {/* Selected Day Details */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">
              Events on {format(selectedDate, "MMMM d, yyyy")}
            </h3>

            {getEventsForDay(selectedDate).length === 0 ? (
              <p className="text-gray-500">No events scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {getEventsForDay(selectedDate).map((booking) => (
                  <div key={booking.id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-800">
                      {booking.event?.title || "Unnamed Event"}
                    </h4>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-start">
                        <ClockIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          {booking.event?.timeslot ? (
                            <p>
                              {formatBookingDate(
                                booking.event.timeslot.start_time || ""
                              )}
                            </p>
                          ) : (
                            <p className="text-gray-500">Not scheduled</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {booking.event?.duration_minutes} minutes
                          </p>
                        </div>
                      </div>

                      {booking.event?.venue && (
                        <div className="flex items-start">
                          <MapPinIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p>{booking.event.venue.name}</p>
                            <p className="text-sm text-gray-500">
                              {booking.event.venue.address}
                            </p>
                          </div>
                        </div>
                      )}

                      {booking.event?.description && (
                        <p className="text-gray-600 mt-2">
                          {booking.event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {selectedEvent && <EventPopup />}
    </div>
  );
}
