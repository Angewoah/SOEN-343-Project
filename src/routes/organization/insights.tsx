import { useEffect, useState } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { fetchEventBookings } from "../../modules/booking/service";
import { fetchEvents } from "../../modules/event/service";
import { getSupabaseClient } from "../../supabase/client";
import { Sidebar } from "../../components/Sidebar";

export const Route = createFileRoute("/organization/insights")({
  component: RouteComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    
    if (error || !data.user) {
      return [];
    }

    const eventArr = await fetchEvents(data.user);
    const bookingArr = await Promise.all(
      eventArr.map(async (event) => {
        return fetchEventBookings(event.id);
      })
    );

    const result = eventArr.map((eventData, i) => {
      const bookingData = bookingArr[i];
      const confirmationData = bookingData.filter((booking) => 
        booking.registration_status === "confirmed");
      return {
        event: eventData,
        confirmations: confirmationData.length,
        tentatives: bookingData.length - confirmationData.length,
      };
    });
    
    return result;
  }
});

function RouteComponent() {
  const supabase = getSupabaseClient();
  const [eventId, setEventId] = useState(null);
  const [query, setQuery] = useState("");
  const eventData = useLoaderData({ from: "/organization/insights" }) ?? [];
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl mb-10">Insights</h1>
        {eventData.map((entry) => {
          const { event, confirmations, tentatives } = entry;
          
          return <div
              key={event.id}
              className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
              >
              <h2 className="text-center">{event.title}</h2>
              <p>Description: {event.description}</p>
              <p>Confirmed Registrations: {confirmations}</p>
              <p>Tentative Registrations: {tentatives}</p>
            {console.log(entry)}
            </div>
        })}
      </div>
    </>
  );
}
