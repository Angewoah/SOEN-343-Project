import { useState } from "react";
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
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 6); // include today
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
  const [eventArr, setEventArr] = useState(eventData);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortMode, setSortMode] = useState("name");
  const dropdown = ["name", "popularity", "trending"].map((name, index) => {
    return <li 
      className="hover:bg-gray-100 rounded-lg" 
      key={index}
      onClick={() => {
        setSortMode(name);
        setSortDropdownVisible(false);
        switch (name) {
          case "popularity": {
            setEventArr(eventData.slice().sort((a, b) => 
              a?.attendees > b?.attendees ? -1 : 1))
            break;
            
          }
          case "trending": {
            setEventArr(eventData.slice().sort((a, b) => 
              a?.weekBookings > b?.weekBookings ? -1 : 1))
            break;
            
          }
          case "name": {
            setEventArr(eventData.slice().sort((a, b) => 
              a?.title > b?.title ? -1 : 1))
            break;
            
          }
          
          default: {
            console.err("Unknown sort \"" + String(name) + "\"");
            break;
            
          }
        }
      }}
    >
      {name}
    </li>
  });
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl">Insights</h1>
        <div className="mt-10">
          <button 
            type="button" 
            className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center flex flex-row place-content-between items-center cursor-pointer w-32"
            onClick={() => {
              setSortDropdownVisible(!sortDropdownVisible);
            }}
          >
            Order by: {sortMode}
            <ChevronDownIcon className="w-4"/>
          </button>
          <div 
            className="max-w-32 cursor-pointer"
          >
            { sortDropdownVisible &&
              <ul className="border-2 rounded-lg border-neutral-300 absolute bg-white z-50 w-32">
                {dropdown}
              </ul>
            }
          </div>
          {eventArr.map((entry) => {
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
                className="border-2 border-neutral-300 rounded-lg my-4 p-4 overflow-hidden"
              >
                <div className="text-xl font-bold">{event.title}</div>
                <div className="flex flex-row items-center">
                  <div className="flex flex-col justify-between items-center">
                    <div className="py-4">
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
                    </div>
                    {/*Pass over the fetched data using the URL.*/}
                    <Link
                      to="/organization/report"
                      state={{ data: {id: event.id, booking: bookingData, title: event.title} }}
                      className="font-medium text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center"
                    >
                      See Report
                    </Link>
                  </div>
                  <Graph 
                    event={event} 
                    bookingData={bookingData}
                    className="w-full h-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
