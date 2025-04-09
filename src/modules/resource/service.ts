// Handle functionalities for manipulating resources

import { User } from "@supabase/supabase-js";
import { useUser } from "../../hooks/useUser";
import { getSupabaseClient } from "../../supabase/client"
import { Database } from "../../supabase/types";
type Event = Database["public"]["Tables"]["events"]["Row"]

const supabase = getSupabaseClient();

export const addResource = async (
  eventId: number,
  resourceName: string,
  resourceStatus: string
): Promise<number> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('add_resource_and_link', {
      event_id: eventId,
      resource_name: resourceName,
      resource_status: resourceStatus
    });
  
  if (error) {
    console.error("Error creating resource:", error);
    throw error;
    
  }
  
  // XXX: Is returning correct data type?
  return data[0];
};

export const fetchResourceFrom = async (
  eventId: number
): Promise<{ name: string, status: string, amount: string }[]> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('select_resources_of_event', { target_event_id: eventId });
  
  if (error) {
    console.error("Error creating resource:", error);
    throw new Error(error);
    
  }
  
  return data;
};