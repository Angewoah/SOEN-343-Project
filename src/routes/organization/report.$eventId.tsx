import { useEffect, useState } from 'react'
import { 
  useLoaderData, 
  createFileRoute, 
  Link, 
  useParams 
} from '@tanstack/react-router'
import { fetchEventBookings } from '../../modules/booking/service'
import { fetchEvents } from '../../modules/event/service'
import { getSupabaseClient } from '../../supabase/client'
import { Sidebar } from '../../components/Sidebar'

export const Route = createFileRoute('/organization/report/$eventId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return fetchEventBookings(params.eventId);
  }
});

function RouteComponent() {
  const bookingData = useLoaderData({ from: '/organization/report/$eventId' }) ?? [];
  const eventId = Number(useParams({ strict: false }).eventId);
  const supabase = getSupabaseClient();
  
  console.log(bookingData);
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl mb-10">Report</h1>
        {bookingData.map((booking, index) => {
          return (
            <div
              key={booking.id}
              className="border-2 border-neutral-300 p-4 mb-4 rounded-lg"
            >
              <h2 className="font-bold">Booking {index+1}</h2>
              <p>Booking id: {booking.id}</p>
              <p>Creation date: {(new Date(booking.created_at).toString())}</p>
            </div>);
        })}
      </div>
    </>
  );
}
