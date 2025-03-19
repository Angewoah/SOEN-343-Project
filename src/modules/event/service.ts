// all event functions, creating events, deleting events, etc

import { getSupabaseClient } from "../../supabase/client"

const supabase = getSupabaseClient();

// Example usage for funsies !
export async function fetchEvents () {
try{ 
  const { data, error } = await supabase
    .from('events')
    .select('*');
    
  
  if (error) throw error
  return data
} catch (err) {
    console.error("Error fetching events", err);
}
}