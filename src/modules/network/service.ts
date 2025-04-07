// all networking functions

import { User } from "@supabase/supabase-js";
import { useUser } from "../../hooks/useUser";
import { getSupabaseClient } from "../../supabase/client"
import { Database } from "../../supabase/types";
type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
type Participants = Database["public"]["Tables"]["participants"]["Row"]
type Messages = Database["public"]["Tables"]["messages"]["Row"]


const supabase = getSupabaseClient();


export async function createNewConversation({
    participantIds,
    eventId,
  }: {
    participantIds: (string | null)[];
    eventId: number;
  }) {try {
        const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .insert({
            title: "New conversation",
            event_id: eventId,
        })
        .select()
        .single();

        if(conversationError) throw conversationError;

        if(!participantIds){
            return;
        }

        
        const participantsToInsert = participantIds.map(userId => ({
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

        const sortedData = data?.sort((a, b) => {
            const timeA = new Date(a.conversations?.last_message_time || 0).getTime();
            const timeB = new Date(b.conversations?.last_message_time || 0).getTime();
            return timeB - timeA; // Descending order (newest first)
          });
        


      
        
      if (error) throw error;
      
      return sortedData;
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