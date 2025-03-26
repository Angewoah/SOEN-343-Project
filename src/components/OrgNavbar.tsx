import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: OrgNavbar,
});

export function OrgNavbar() {
  return (
    <div className="flex justify-between items-center my-4 pr-4">
      <h1 className="font-mono text-2xl pl-6">stitch</h1>
      <Link to="/client/events" className="text-base font-mono">
        switch to client page
      </Link>
    </div>
  );
}
