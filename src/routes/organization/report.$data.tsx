import { useEffect, useState } from 'react';
import { 
  useLoaderData, 
  createFileRoute, 
  Link, 
  useParams 
} from '@tanstack/react-router';
import { fetchEventBookings } from '../../modules/booking/service';
import { fetchEvents } from '../../modules/event/service';
import { Graph } from "../../components/Graph";
import { Sidebar } from '../../components/Sidebar';

function capitalize(s) {
  return s.slice(0,1).toUpperCase() + s.slice(1).toLowerCase();
}

export const Route = createFileRoute('/organization/report/$data')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return JSON.parse(params.data);
  }
});

function RouteComponent() {
  const data = useLoaderData({ from: '/organization/report/$data' }) ?? [];
  const params = JSON.parse(useParams({ strict: false }).data);
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl mb-10">{data.title} - Report</h1>
        <Graph bookingData={params.booking} className="w-full pb-8"/>
        <div>
          <h2 className="text-lg font-semibold pb-4">Booking Data</h2>
          <table className="table-auto border-separate p-2 border-1 border-purple-600 rounded-lg w-full">
            <thead>
              <tr className="bg-purple-100">
                <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Booking Id</th>
                <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Registration Status</th>
                <th className="px-4 py-2 border-b-2 border-purple-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
            {params.booking.map((booking) => {
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
      </div>
    </>
  );
}
