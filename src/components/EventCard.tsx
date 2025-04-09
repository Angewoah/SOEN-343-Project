import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Database } from "../supabase/types";
import { useState } from "react";

type EventType = Database["public"]["Tables"]["events"]["Row"];
type VenueType = Database["public"]["Tables"]["venues"]["Row"];
type TimeslotType = Database["public"]["Tables"]["venue_timeslots"]["Row"];

export type EventWithDetails = EventType & {
  venue?: VenueType | null;
  timeslot?: TimeslotType | null;
};

interface EventCardProps {
  event: EventWithDetails;
  isBooking: boolean;
  onBookClick: () => void;
  formatDate: (date?: string) => string;
}

const EventCard = ({ event, isBooking, onBookClick, formatDate }: EventCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBookClick = () => {
    setIsLoading(true);
    onBookClick();
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-neutral-50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow w-[300px] h-[320px] flex flex-col relative">
      {/* Content area */}
      <div className="flex-grow overflow-auto">
        <h2 className="text-lg font-semibold">{event.title}</h2>
        <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>

        {/* Display tags if available */}
        {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  tag === "educational"
                    ? "bg-blue-100 text-blue-700"
                    : tag === "entertainment"
                    ? "bg-purple-100 text-purple-700"
                    : tag === "networking"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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
      </div>
      
      {/* Button section - fixed at bottom */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-2 absolute bottom-5 left-5 right-5">
        <Link
          to="/client/events/$eventId"
          params={{ eventId: String(event.id) }}
          className="flex-1 flex justify-center items-center bg-gray-100 text-blue-600 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          <span>View Details</span>
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>

        {/* Book Now Button */}
        <Link
          to="/client/payment"
          className="flex-1 flex justify-center items-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed hover:cursor-pointer"
          onClick={handleBookClick}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Booking...</span>
            </div>
          ) : (
            <span>Book Now</span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;