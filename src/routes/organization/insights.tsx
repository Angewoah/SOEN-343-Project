import { useEffect, useState } from "react";
import { useLoaderData, createFileRoute, Link } from "@tanstack/react-router";
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
      const attendeeData = bookingData.filter((booking) => 
        booking.type === "attendee");
      return {
        event: eventData,
        confirmations: confirmationData.length,
        tentatives: bookingData.length - confirmationData.length,
        attendees: attendeeData.length
      };
    });
    
    return result;
  }
});

function RouteComponent() {
  const eventData = useLoaderData({ from: "/organization/insights" }) ?? [];
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl mb-10">Insights</h1>
        {eventData.map((entry) => {
          const { event, confirmations, tentatives, attendees } = entry;
          return (<div
              key={event.id}
              className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
              >
              <h2 className="text-center">{event.title}</h2>
              <div>
                <p>Description: {event.description}</p>
                <p>Status: {event.status}</p>
                <p>Confirmed Registrations: {confirmations}</p>
                <p>Pending Registrations: {tentatives}</p>
                <p>
                  Total Amount of Attendees: {attendees} 
                  /{event.max_attendees}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-48">
                <Link
                  to="/organization/report/$eventId"
                  params={{ eventId: `${event.id}` }}
                  className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center"
                >
                  See Report
                </Link>
              </div>
            </div>);
        })}
      </div>
    </>
  );
}
