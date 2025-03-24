import * as React from "react";
import {
  Link,
  Navigate,
  Outlet,
  createRootRoute,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { getSupabaseClient } from "../supabase/client";
import { useUser } from "../hooks/useUser";

export const Route = createRootRoute({
  component: Sidebar,
});

export function Sidebar() {
  const supabase = getSupabaseClient();

  const navigate = useNavigate();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out", error);
    } else {
      navigate({ to: "/" });
    }
  };
  return (
    <>
      <div className="h-full flex flex-col justify-between text-lg w-full max-w-64 px-4 pt-3 border-r border-neutral-300">
        <div className="flex flex-col gap-y-4">
          <Link
            to="/organization/dashboard"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            activeOptions={{ exact: true }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/organization/events"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Events
          </Link>
          <Link
            to="/organization/network"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Network
          </Link>
          <Link
            to="/organization/marketing"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Marketing
          </Link>
          <Link
            to="/organization/insights"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Insights
          </Link>
          <Link
            to="/organization/payment"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Payment
          </Link>
          <Link
            to="/organization/settings"
            activeProps={{
              className: "font-medium text-purple-600/80",
            }}
            className="text-base rounded-sm p-1 hover:bg-neutral-200/70 transition-colors"
          >
            Settings
          </Link>
        </div>
        <button
          className="text-xl font-normal text-white mb-8 py-2 px-2 bg-neutral-800 rounded-md border border-neutral-300 hover:bg-neutral-600 transition-colors cursor-pointer"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </>
  );
}
