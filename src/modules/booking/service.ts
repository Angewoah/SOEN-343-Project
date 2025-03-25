import { getSupabaseClient } from "../../supabase/client";

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

export async function createBooking(bookingData: BookingData) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: bookingData.user_id,
          event_id: bookingData.event_id,
          registration_status: bookingData.status,
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (err) {
    console.error('Error in createBooking:', err);
    throw err;
  }
}