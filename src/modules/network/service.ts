// all networking functions

import { User } from "@supabase/supabase-js";
import { useUser } from "../../hooks/useUser";
import { getSupabaseClient } from "../../supabase/client"
import { Database } from "../../supabase/types";
type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
type Participants = Database["public"]["Tables"]["participants"]["Row"]
type Messages = Database["public"]["Tables"]["messages"]["Row"]


const supabase = getSupabaseClient();


export async function createNewConversation(participantsIds: string[]) {
    
    try {
        const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .insert({
            title: "New conversation"
        })
        .select()
        .single();

        if(conversationError) throw conversationError;

        const participantsToInsert = participantsIds.map(userId => ({
            conversation_id: conversationData.id,
            user_id: userId
        }));

        const { error: participantError } = await supabase
            .from("participants")
            .insert(participantsToInsert);

            if(participantError) throw participantError;

            return conversationData;
    } catch (error) {
        console.error("Error creating conversation", error);
        return null;
    }
}

export async function fetchUserConversations(user: User) {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("participants")
        .select(`
          id,
          conversation_id,
          conversations:conversations!conversation_id (
            id,
            title,
            last_message_text,
            last_message_time,
            participants:participants (
              id,
              user_id,
              profiles:profiles!user_id (
                id,
                email
              )
            )
          )
        `)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error("Error fetching conversations", err);
      return [];
    }
  }

  export async function fetchAllMessages(conversationId: number) {
    try {
        const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          conversation_id,
          profiles:profiles!sender_id (
            id,
            email
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
  
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error("Error fetching messages", err);
      return { data: null, error: err };
    }
  }

  export async function sendMessage(
    conversationId: number, 
    content: string, 
    senderId: string
  ) {
    try {
      const { error: messageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        content,
        sender_id: senderId,
        is_read: false
      });
  
      if (messageError) throw messageError;
  
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message_text: content,
          last_message_time: new Date().toISOString()
        })
        .eq('id', conversationId);
  
      if (updateError) throw updateError;
  
      return { error: null };
    } catch (err) {
      console.error("Error sending message", err);
      return { error: err };
    }
  }



export async function createEvent(
  organizerId: string, 
  title: string, 
  description: string, 
  duration: number, 
  maxAttendees: number,
) {
  try {
    const { data, error } = await supabase.from('events').insert({
      organizer_id: organizerId,
      title,
      description,
      duration_minutes: duration,
      max_attendees: maxAttendees,
      status: 'inactive' 
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