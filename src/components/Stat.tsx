import * as React from "react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { 
  ArrowTrendingUpIcon,
  MinusIcon
} from "../../node_modules/@heroicons/react/16/solid";

export function StatDisplay(props) {
  const Icon = props?.icon;
  return <div className="flex items-center text-sm text-gray-600">
    <Icon className="w-4 h-4 mr-2 text-purple-500"/>
    {props?.text}
  </div>
}

export function WeekBookings({ bookings }) {
  return bookings == 0 ? 
  <StatDisplay 
    text={"No new bookings since last week"}
    icon={MinusIcon}
  /> : <StatDisplay 
    text={`${bookings} new booking${bookings == 1 ? "" : "s"} last week`}
    icon={ArrowTrendingUpIcon}
  />
}