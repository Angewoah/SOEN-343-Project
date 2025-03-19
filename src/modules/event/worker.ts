// all event functions, creating events, deleting events, etc

import { getSupabaseClient } from "../../supabase/client"

const supabase = getSupabaseClient();

// Example usage
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*');
    
  
  if (error) throw error
  return data
}