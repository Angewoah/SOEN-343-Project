import { getSupabaseClient } from "../../supabase/client";
import { Database } from "../../supabase/types";

export type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  event?: Database['public']['Tables']['events']['Row'] & {
    venue?: Database['public']['Tables']['venues']['Row'] | null;
    timeslot?: Database['public']['Tables']['venue_timeslots']['Row'] | null;
  } | null;
};

export async function fetchUserBookings(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:event_id(
          *,
          venue:venue_id(*),
          timeslot:venue_timeslot_id(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in fetchUserBookings:', err);
    return [];
  }
}

type BookingData = {
  user_id: string;
  event_id: number;
  status: string;
};

/**
 * Get CSS classes for styling a booking type badge
 * @param bookingType The type of booking (attendee or speaker)
 * @returns CSS classes for the badge
 */
export const getBookingTypeStyle = (bookingType?: string) => {
  switch (bookingType?.toLowerCase()) {
    case 'speaker':
      return 'bg-purple-100 text-purple-800';
    case 'attendee':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get a user-friendly label for booking types
 * @param bookingType The type of booking
 * @returns A formatted label for display
 */
export const getBookingTypeLabel = (bookingType?: string) => {
  switch (bookingType?.toLowerCase()) {
    case 'speaker':
      return 'Speaker';
    case 'attendee':
      return 'Attendee';
    default:
      return bookingType || 'Unknown';
  }
};

export async function fetchConfirmedBookings(userId: string): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseClient();
  
  // Explicitly define the types we're selecting to avoid any schema mismatches
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      user_id,
      event_id,
      registration_status,
      type,
      created_at,
      event:event_id (
        id,
        title,
        description, 
        duration_minutes,
        max_attendees,
        venue:venue_id (
          id,
          name,
          address
        ),
        timeslot:venue_timeslot_id (
          id,
          start_time,
          end_time
        )
      )
    `)
    .eq('user_id', userId)
    .eq('registration_status', 'confirmed');
    
  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Database query failed: ${error.message}`);
  }
  
  // Filter bookings to only include those with valid timeslot data
  const validBookings = data?.filter(booking => 
    booking.event && 
    booking.event.timeslot && 
    booking.event?.timeslot?.start_time
  ) || [];
  
  return validBookings;
}

/**
 * Create a new booking
 * @param bookingData Data for the new booking
 * @returns The created booking
 */
export async function createBooking(bookingData: {
  user_id: string;
  event_id: number;
  status?: string;
  type?: string;
}) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: bookingData.user_id,
      event_id: bookingData.event_id,
      registration_status: bookingData.status || 'pending',
      type: bookingData.type || 'attendee'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Failed to create booking:", error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }
  
  return data;
}