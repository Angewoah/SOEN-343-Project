// all event functions, creating events, deleting events, etc

import { User } from "@supabase/supabase-js";
import { useUser } from "../../hooks/useUser";
import { getSupabaseClient } from "../../supabase/client"
import { Database } from "../../supabase/types";
type Event = Database["public"]["Tables"]["events"]["Row"]

const supabase = getSupabaseClient();

export async function fetchEvents (user: User) {
  if (!user) return;
try{ 
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq("organizer_id", user?.id)
    
  
  if (error) throw error
  return data
} catch (err) {
    console.error("Error fetching events", err);
}
}

export async function createTimeslot(
  venueId: number,
  startTime: Date,
  duration: number
): Promise<number> {
  try {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    const { data, error } = await supabase
      .from('venue_timeslots')
      .insert({
        venue_id: venueId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: duration,
        is_available: false
      })
      .select('id');
    
    if (error) {
      console.error("Error creating venue timeslot", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("Failed to create timeslot");
    }
    
    return data[0].id;
  } catch (err) {
    console.error("Error creating timeslot", err);
    throw err;
  }
}


export const createEvent = async (
  organizerId: string,
  title: string,
  description: string,
  durationMinutes: number,
  maxAttendees: number,
  tags: string[]
): Promise<number> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        organizer_id: organizerId,
        title,
        description,
        duration_minutes: durationMinutes,
        max_attendees: maxAttendees,
        status: 'inactive',
        tags: tags.join(',')
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    // Return the new event ID
    return data.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export async function updateEvent(eventId: number, title: string, description: string) {
  try {
    const { error } = await supabase
    .from("events")
    .update({ title: title, description: description })
    .eq("id", eventId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating event", error)
  }
} 



export async function fetchAllEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching all events", err);
    return [];
  }
}



export async function fetchAllEventsWithDetails() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venue_id(*),
        timeslot:venue_timeslot_id(*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching all events with details", err);
    return [];
  }
}

export async function fetchEventById(eventId: string) {
  try {
    console.log("Service: Fetching event with ID:", eventId);
    
    if (!eventId) {
      console.error("Invalid event ID provided:", eventId);
      return null;
    }
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venue_id(*),
        timeslot:venue_timeslot_id(*)
      `)
      .eq('id', parseInt(eventId))
      .single();
    
    if (error) {
      console.error("Error fetching event by ID:", error);
      return null;
    }
    
    console.log("Service: Found event data:", data);
    return data;
  } catch (err) {
    console.error(`Error fetching event with ID ${eventId}:`, err);
    return null;
  }
}

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