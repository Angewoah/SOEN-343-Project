// all event functions, creating events, deleting events, etc

import { User } from "@supabase/supabase-js";
import { useUser } from "../../hooks/useUser";
import { getSupabaseClient } from "../../supabase/client"

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


export async function createEvent(
  organizerId: string, 
  title: string, 
  description: string, 
  duration: number, 
  maxAttendees: number,
  venueId?: string,
  eventDateTime?: Date
) {
  try {
    // Convert venueId to number
    const venueIdNumber = venueId ? parseInt(venueId) : null;
    
    // Create timeslot if venue and date time are provided
    let timeslotId = null;
    if (venueIdNumber && eventDateTime) {
      timeslotId = await createTimeslot(venueIdNumber, eventDateTime, duration);
    }
    
    // Create the event with the timeslot ID if available
    const { data, error } = await supabase.from('events').insert({
      organizer_id: organizerId,
      title,
      description,
      duration_minutes: duration,
      max_attendees: maxAttendees,
      venue_id: venueIdNumber,
      venue_timeslot_id: timeslotId,
      status: 'active' // Setting a default status
    })
    .select();

    if (error) {
      console.error("Error inserting event", error);
      throw error;  
    }
    
    return data?.[0];
  } catch (err) {
    console.error("Error creating event", err);
    throw err; 
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