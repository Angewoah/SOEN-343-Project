import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { getSupabaseClient } from "../supabase/client";

export function ClientNavbar() {
  const supabase = getSupabaseClient();

  const navigate = useNavigate();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out", error);
    } else {
      navigate({ to: "/login" });
    }
  };
  return (
    <div className="flex justify-between items-center my-4 px-6">
      <h1 className="font-mono text-2xl">stitch</h1>
      <div className="flex gap-6">
        <Link
          to="/client/events"
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
        >
          Events
        </Link>
        <Link
          to="/client/bookings"
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
        >
          Bookings
        </Link>
        <Link
          to="/client/calendar"
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
        >
          Calendar
        </Link>
        <Link
          to="/client/messages"
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
        >
          Messages
        </Link>
        <Link
          to="/organization/events/all"
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
        >
          Switch to Event Organizer
        </Link>
        <button
          className="text-base font-mono hover:text-purple-600 cursor-pointer"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
