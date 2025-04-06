import {
  createFileRoute,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";
import { fetchAllMessages, sendMessage } from "../../modules/network/service";
import { getSupabaseClient, supabase } from "../../supabase/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Database } from "../../supabase/types";
import { useUser } from "../../hooks/useUser";
import { format } from "date-fns";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export const Route = createFileRoute("/organization/network/$conversationId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data: user, error } = await getSupabaseClient().auth.getUser();

    if (error || !user) {
      return [];
    }

    const conversationId = Number(params.conversationId);
    const { data: messages, error: fetchError } =
      await fetchAllMessages(conversationId);

    if (fetchError || !messages) {
      return [];
    }

    return messages;
  },
});

function RouteComponent() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { conversationId } = Route.useParams();
  const subscriptionRef = useRef<any>(null);
  const loaderData = useLoaderData({
    from: "/organization/network/$conversationId",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Array.isArray(loaderData)) {
      setMessages(loaderData);
    }
  }, [loaderData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !conversationId) return;

    await sendMessage(Number(conversationId), newMessage, user.id);
    setNewMessage("");
  };

  useEffect(() => {
    if (!conversationId) return;

    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessageId = payload.new.id;
          const { data: newMessageWithProfile } = await supabase
            .from("messages")
            .select(
              `
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
            `
            )
            .eq("id", newMessageId)
            .single();

          if (newMessageWithProfile) {
            setMessages((prev) => [...prev, newMessageWithProfile]);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              <div className="p-4 rounded-lg shadow-2xs bg-neutral-100 w-fit max-w-[75%] break-words">
                {message.content}
              </div>
              {message.created_at && (
                <span className="text-xs text-neutral-500">
                  {format(new Date(message.created_at), "MMM d, h:mm a")}
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full bg-white border-t border-neutral-200">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 disabled:bg-purple-200 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
