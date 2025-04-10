import { useEffect, useState } from 'react';
import { 
  useLoaderData, 
  createFileRoute,
  useMatch,
  useLocation  
} from '@tanstack/react-router';
import { fetchEventBookings } from '../../modules/booking/service';
import { fetchEvents } from '../../modules/event/service';
import { DatumMenu } from '../../components/DatumMenu';
import { Graph } from "../../components/Graph";
import { Sidebar } from '../../components/Sidebar';

function capitalize(s) {
  return s.slice(0,1).toUpperCase() + s.slice(1).toLowerCase();
}

export const Route = createFileRoute('/organization/report')({
  component: RouteComponent,
});

function RouteComponent() {
  const { state } = useLocation();
  if (!state) {
    return <p className="m-4">Failed to generate a report.</p>
    
  }
  const data = state.data;
  
  return <DatumMenu title={"Report - " + data.title} page="insights">
    <Graph bookingData={data.booking} className="w-full pb-8"/>
    <div>
      <div className="text-xl font-bold pb-4">Booking Data</div>
      <table className="table-auto border-separate p-2 border-1 border-purple-600 rounded-lg w-full">
        <thead>
          <tr className="bg-purple-100">
            <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Booking Id</th>
            <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Registration Status</th>
            <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
        {data.booking.map((booking) => {
          return (
            <tr key={booking.id} className="even:bg-purple-50 odd:bg-white even:hover:bg-purple-200 odd:hover:bg-purple-100 transition-colors">
              <td className="px-4 py-2 border-b border-purple-300">{booking.id}</td>
              <td className="px-4 py-2 border-b border-purple-300">{capitalize(booking.registration_status)}</td>
              <td className="px-4 py-2 border-b border-purple-300">{`${new Date(booking.created_at).toLocaleDateString()}`}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  </DatumMenu>
}
