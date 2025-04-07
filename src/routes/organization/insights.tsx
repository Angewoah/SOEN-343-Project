import { useEffect, useState } from "react";
import { useLoaderData, createFileRoute, Link } from "@tanstack/react-router";
import { 
  ChevronDownIcon,
  UserGroupIcon,
  ClipboardIcon,
  ExclamationCircleIcon
} from "../../../node_modules/@heroicons/react/16/solid";
import { fetchEventBookings } from "../../modules/booking/service";
import { fetchEvents } from "../../modules/event/service";
import { getSupabaseClient } from "../../supabase/client";
import { Sidebar } from "../../components/Sidebar";
import { Graph } from "../../components/Graph";
import { 
  StatDisplay,
  WeekBookings
} from "../../components/Stat";

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
      const lastWeek = (new Date()).getDate() - 7;
      const weekBookings = bookingData.filter((booking) =>
        new Date(booking.created_at) > lastWeek).length;
      return {
        event: eventData,
        confirmations: confirmationData.length,
        bookingData: bookingData,
        attendees: attendeeData.length,
        weekBookings: weekBookings
      };
    });
    
    return result;
  }
});

function Detail(props) {
  return <div className="flex items-center text-sm text-gray-600">
    {props?.children}
    {props?.text}
  </div>
}

function RouteComponent() {
  const eventData = useLoaderData({ from: "/organization/insights" }) ?? [];
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortMode, setSortMode] = useState("popularity");
  const dropdown = ["popularity", "trending"].map((name, index) => {
    return <li 
      className="hover:bg-gray-100 rounded-lg" 
      key={index}
      onClick={() => {
        setSortMode(name);
        setSortDropdownVisible(false);
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
              setSortDropdownVisible(!sortDropdownVisible);
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
            { sortDropdownVisible ? 
              <ul className="border-2 rounded-lg border-neutral-300">
                {dropdown}
              </ul>
              : ""
            }
          </div>
          {eventData.map((entry) => {
            const { 
              event, 
              confirmations, 
              bookingData, 
              attendees, 
              weekBookings 
            } = entry;
            const bookings = bookingData.length;
            return (
              <div
                key={event.id}
                className="border-2 border-neutral-300 rounded-lg my-4 p-2"
              >
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <div className="place-content-between gap-4 flex flex-row">
                  <div>
                    <StatDisplay 
                      text={`Attendees: ${attendees}/${event.max_attendees}`}
                      icon={UserGroupIcon}
                    />
                    <StatDisplay 
                      text={bookings > 0 ? `Confirmations: ${confirmations}/${bookings} booking${bookings === 1 ? "" : "s"}`
                      : "No bookings so far"}
                      icon={ClipboardIcon}
                    />
                    <StatDisplay 
                      text={`Status: ${event.status}`}
                      icon={ExclamationCircleIcon}
                    />
                    <WeekBookings bookings={weekBookings}/>
                    <div className="flex flex-col gap-2 w-full max-w-48 ">
                      <Link
                        to="/organization/report/$eventId"
                        params={{ eventId: `${event.id}` }}
                        className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center"
                      >
                        See Report
                      </Link>
                    </div>
                  </div>
                  <Graph event={event}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
