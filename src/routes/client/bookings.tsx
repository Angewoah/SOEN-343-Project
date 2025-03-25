import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ClockIcon as PendingIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { fetchUserBookings } from '../../modules/booking/service';
import { getSupabaseClient } from '../../supabase/client';
import { Database } from '../../supabase/types';

export const Route = createFileRoute('/client/bookings')({
  component: BookingsComponent,
});

type EventType = Database["public"]["Tables"]["events"]["Row"];
type VenueType = Database["public"]["Tables"]["venues"]["Row"];
type TimeslotType = Database["public"]["Tables"]["venue_timeslots"]["Row"];
type BookingType = Database["public"]["Tables"]["bookings"]["Row"];

type BookingWithDetails = BookingType & {
  status: BookingStatus; 
  event?: EventType & {
    venue?: VenueType | null;
    timeslot?: TimeslotType | null;
  };
};

type BookingStatus = 'confirmed' | 'pending' | 'declined' | 'all';

function BookingsComponent() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = getSupabaseClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          setError("You must be logged in to view your bookings");
          setLoading(false);
          return;
        }
        
        const data = await fetchUserBookings(userData.user.id);
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setError("An error occurred while loading your bookings");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const StatusIndicator = ({ status }: { status: string }) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="w-5 h-5 mr-1" />
            <span>Confirmed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <PendingIcon className="w-5 h-5 mr-1" />
            <span>Pending</span>
          </div>
        );
      case 'declined':
        return (
          <div className="flex items-center text-red-500">
            <XCircleIcon className="w-5 h-5 mr-1" />
            <span>Declined</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {/* Status Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-lg font-medium hover:cursor-pointer ${
            activeTab === 'all' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Bookings
        </button>
        <button
          className={`py-3 px-6 text-lg font-medium hover:cursor-pointer ${
            activeTab === 'confirmed' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`py-3 px-6 text-lg font-medium hover:cursor-pointer ${
            activeTab === 'pending' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`py-3 px-6 text-lg font-medium hover:cursor-pointer ${
            activeTab === 'declined' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('declined')}
        >
          Declined
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">
            {activeTab === 'all' 
              ? "You don't have any bookings yet." 
              : `You don't have any ${activeTab} bookings.`}
          </p>
          <button 
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors  hover:cursor-pointer"
            onClick={() => window.location.href = '/client/events'}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4 border-b">Event</th>
                <th className="text-left p-4 border-b">Venue</th>
                <th className="text-left p-4 border-b">Date & Time</th>
                <th className="text-left p-4 border-b">Status</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">
                    <div>
                      <p className="font-medium">{booking.event?.title || "Unnamed Event"}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{booking.event?.description}</p>
                    </div>
                  </td>
                  <td className="p-4 border-b">
                    <div className="flex items-start">
                      <MapPinIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{booking.event?.venue?.name || "No venue"}</p>
                        <p className="text-sm text-gray-500">{booking.event?.venue?.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b">
                    <div className="flex items-start">
                      <CalendarIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        {booking.event?.timeslot ? (
                          <p>{formatDate(booking.event.timeslot.start_time ?? undefined)}</p>
                        ) : (
                          <p className="text-gray-500">Not scheduled</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {booking.event?.duration_minutes} minutes
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b">
                    <StatusIndicator status={booking.status} />
                  </td>
                  <td className="p-4 border-b">
                    {booking.status === 'confirmed' && (
                      <button className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors">
                        Cancel
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Awaiting confirmation</p>
                        <button className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors">
                          Cancel Request
                        </button>
                      </div>
                    )}
                    {booking.status === 'declined' && (
                      <button className="bg-blue-100 text-blue-700 px-4 py-1 rounded hover:bg-blue-200 transition-colors">
                        Book Similar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}