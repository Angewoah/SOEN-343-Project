import * as React from "react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { 
  ArrowTrendingUpIcon,
  MinusIcon
} from "../../node_modules/@heroicons/react/16/solid";

export function StatDisplay(props) {
  const Icon = props?.icon;
  return <div className="flex flex-row items-center gap-2 [&:not(:last-child)]:border-b-2 border-purple-100 py-1">
    <Icon className="w-4 h-4 text-purple-500"/>
    <span className="w-full">{props?.text}</span>
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