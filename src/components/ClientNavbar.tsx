import * as React from "react";
import { Link } from "@tanstack/react-router";

export function ClientNavbar() {
  return (
    <div className="flex justify-between items-center my-4 px-6">
      <h1 className="font-mono text-2xl">stitch</h1>
      <div className="flex gap-6">
        <Link to="/client/events" className="text-base font-mono hover:text-purple-600">
          Events
        </Link>
        <Link to="/client/bookings" className="text-base font-mono hover:text-purple-600">
          My Bookings
        </Link>
        <Link to="/organization/" className="text-base font-mono hover:text-purple-600">
          Switch to Event Organizer
        </Link>
      </div>
    </div>
  );
}