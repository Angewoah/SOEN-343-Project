import { useEffect, useState } from "react";
import { useLoaderData, createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "../../../node_modules/@heroicons/react/16/solid";
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

function Filter(props) {
  return <div
    className="hover:bg-gray-100 rounded-lg">By {props.name}</div>
}

function RouteComponent() {
  const eventData = useLoaderData({ from: "/organization/insights" }) ?? [];
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterMode, setFilterMode] = useState("popularity");
  const dropdown = ["popularity", "trending"].map((name, index) => {
    return <li 
      className="hover:bg-gray-100 rounded-lg" 
      key={index}
      onClick={() => {
        setFilterMode(name);
        setFilterDropdownVisible(false);
      }}
    >
      By {name}
    </li>
  });
  
  return (
    <>
      <Sidebar />
      <div className="w-full px-72 justify-end-safe pt-4">
        <h1 className="text-4xl">Insights</h1>
        <div className="mt-10">
          <button 
            type="button" 
            className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center flex flex-row place-content-between items-center cursor-pointer w-32"
            onClick={() => {
              setFilterDropdownVisible(!filterDropdownVisible);
            }}
          >
            Sort 
            <ChevronDownIcon className="w-4"/>
          </button>
          <div 
            className="max-w-32 cursor-pointer"
            onClick={() => {
              
            }}
          >
            { filterDropdownVisible ? 
              <ul className="border-2 rounded-lg border-neutral-300">
                {dropdown}
              </ul>
              : ""
            }
          </div>
          {eventData.map((entry) => {
            const { event, confirmations, tentatives, attendees } = entry;
            return (
              <div
                key={event.id}
                className="border-2 border-neutral-300 rounded-lg my-4"
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
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
