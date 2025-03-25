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

export async function createEvent(organizerId: string,title: string, description: string, duration: number, maxAttendees: number) {
  try {
    const { data, error } = await supabase.from('events').insert({
      organizer_id: organizerId,
      title,
      description,
      duration_minutes: duration,
      max_attendees: maxAttendees

    })
    .select();

    if (error) {
      console.error("Error inserting event", error);
      throw new Error("Failed to create event", error);
    }
    return data?.[0]
  } catch (err) {
    console.error("Error creative event", err);

  }
}