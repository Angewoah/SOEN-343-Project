import {
  createFileRoute,
  Link,
  Outlet,
  useLoaderData,
} from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { getSupabaseClient, supabase } from "../../supabase/client";
import { fetchUserConversations } from "../../modules/network/service";
import { useUser } from "../../hooks/useUser";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/organization/network")({
  component: RouteComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();

    if (error || !data.user) {
      return [];
    }

    return fetchUserConversations(data.user);
  },
});

function RouteComponent() {
  const { user } = useUser();
  const initialConversations =
    useLoaderData({ from: "/organization/network" }) ?? [];
  const [conversations, setConversations] = useState(initialConversations);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    if (!user?.id) return;

    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const fetchUpdatedConversations = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select(
          `
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
      `
        )
        .eq("user_id", user.id);

      const sortedData = data?.sort((a, b) => {
        const timeA = new Date(
          a.conversations?.last_message_time || 0
        ).getTime();
        const timeB = new Date(
          b.conversations?.last_message_time || 0
        ).getTime();
        return timeB - timeA; // Descending order (newest first)
      });

      if (sortedData) {
        setConversations(sortedData);
      }
    };

    const channel = supabase
      .channel(`user-conversations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          await fetchUpdatedConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        async (payload) => {
          await fetchUpdatedConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
        },
        async (payload) => {
          await fetchUpdatedConversations();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      <Sidebar />
      <div className="min-w-92 flex flex-col border-r border-r-neutral-400 h-full overflow-hidden">
        {/* Conversations list */}
        <div className="flex flex-col">
          {conversations && conversations.length > 0 ? (
            conversations.map((participantData: any) => {
              const conversation = participantData.conversations;
              return (
                <Link
                  key={conversation.id}
                  to="/organization/network/$conversationId"
                  params={{ conversationId: conversation.id }}
                  className="flex flex-row items-center p-4 border-y border-neutral-200 hover:border-neutral-400 hover:shadow transition-all cursor-pointer"
                  activeProps={{
                    className: "font-medium bg-neutral-200",
                  }}
                >
                  <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-medium text-neutral-600 mr-4">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      {conversation.last_message_time && (
                        <span className="text-xs text-neutral-500">
                          {format(
                            new Date(conversation.last_message_time),
                            "MMM d, h:mm a"
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neutral-600 truncate max-w-full">
                      {conversation.title || "No messages yet"}
                    </p>

                    <div className="flex items-center mt-2 text-xs text-neutral-500">
                      <span>
                        {conversation.participants?.length || 0} participant
                        {conversation.participants?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center border border-dashed border-neutral-300 rounded-lg">
              <p className="text-neutral-600">No conversations found</p>
            </div>
          )}
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
