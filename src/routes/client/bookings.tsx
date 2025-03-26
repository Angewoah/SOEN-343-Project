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
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);

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
        console.log("Fetched bookings:", data); // Debug log to see what's coming back
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

  // Helper function to get booking status regardless of field name
  const getBookingStatus = (booking: BookingWithDetails): string => {
    // Try all possible field names for status
    return booking.registration_status || 
           'pending' || // Default to pending if no status found
           'pending'; // Default to pending if no status found
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return getBookingStatus(booking).toLowerCase() === activeTab;
  });

  const StatusIndicator = ({ booking }: { booking: BookingWithDetails }) => {
    const status = getBookingStatus(booking).toLowerCase();
    
    switch (status) {
      case 'confirmed':
      case 'accepted':
      case 'approved':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="w-5 h-5 mr-1" />
            <span>Confirmed</span>
          </div>
        );
      case 'pending':
      case 'awaiting':
      case 'in review':
        return (
          <div className="flex items-center text-yellow-500">
            <PendingIcon className="w-5 h-5 mr-1" />
            <span>Pending</span>
          </div>
        );
      case 'declined':
      case 'rejected':
      case 'cancelled':
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

  const handleSpeakerResponse = async (bookingId: number, accept: boolean) => {
    try {
      setProcessingBookingId(bookingId);
      
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          registration_status: accept ? 'confirmed' : 'declined' 
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, registration_status: accept ? 'confirmed' : 'declined' } 
          : booking
      ));
      
      //alert(`You have ${accept ? 'accepted' : 'declined'} the invitation`);
    } catch (err) {
      console.error(`Failed to ${accept ? 'accept' : 'decline'} invitation:`, err);
      //alert(`Failed to ${accept ? 'accept' : 'decline'} invitation. Please try again.`);
    } finally {
      setProcessingBookingId(null);
    }
  };
  
  const handleReconsiderSpeaking = async (bookingId: number) => {
    try {
      setProcessingBookingId(bookingId);
      
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('bookings')
        .update({ registration_status: 'pending' })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, registration_status: 'pending' } 
          : booking
      ));
      
      //alert("Your decision has been reset to pending");
    } catch (err) {
      console.error("Failed to reset decision:", err);
      //alert("Failed to reset your decision. Please try again.");
    } finally {
      setProcessingBookingId(null);
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
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors hover:cursor-pointer"
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
                <th className="text-left p-4 border-b">Type</th>
                <th className="text-left p-4 border-b">Status</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const status = getBookingStatus(booking).toLowerCase();
                
                return (
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
                      <div className="px-3 py-1 inline-block bg-gray-100 text-gray-800 rounded-full text-sm">
                        {booking.type || "Null"}
                      </div>
                    </td>
                    <td className="p-4 border-b">
                      <StatusIndicator booking={booking} />
                    </td>
                    <td className="p-4 border-b">
                      {booking.type === 'attendee' ? (
                        <>
                          {status === 'confirmed' && (
                            <button className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors">
                              Cancel
                            </button>
                          )}
                          {status === 'pending' && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">Awaiting confirmation</p>
                              <button className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors">
                                Cancel Request
                              </button>
                            </div>
                          )}
                          {status === 'declined' && (
                            <button className="bg-blue-100 text-blue-700 px-4 py-1 rounded hover:bg-blue-200 transition-colors">
                              Book Similar
                            </button>
                          )}
                        </>
                      ) : booking.type === 'speaker' ? (
                      <>
                        {status === 'pending' && (
                          <div className="flex space-x-2">
                            <button 
                              className="bg-green-100 text-green-700 px-4 py-1 rounded hover:bg-green-200 transition-colors"
                              onClick={() => handleSpeakerResponse(booking.id, true)}
                            >
                              Accept
                            </button>
                            <button 
                              className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors"
                              onClick={() => handleSpeakerResponse(booking.id, false)}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {status === 'confirmed' && (
                          <div className="space-y-2">
                            <span className="text-green-500 font-medium flex items-center">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              You've accepted
                            </span>
                            <button 
                              className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition-colors w-full"
                              onClick={() => handleReconsiderSpeaking(booking.id)}
                            >
                              Cancel Appearance
                            </button>
                          </div>
                        )}
                        {status === 'declined' && (
                          <div className="space-y-2">
                            <span className="text-red-500 font-medium flex items-center">
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              You've declined
                            </span>
                            <button 
                              className="bg-blue-100 text-blue-700 px-4 py-1 rounded hover:bg-blue-200 transition-colors w-full"
                              onClick={() => handleReconsiderSpeaking(booking.id)}
                            >
                              Set to Pending
                            </button>
                          </div>
                        )}
                      </>
                      ) : (
                        // Default actions for other booking types
                        <div className="text-gray-500 text-sm italic">
                          No actions available
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}