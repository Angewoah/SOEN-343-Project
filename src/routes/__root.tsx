import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Sidebar } from "../components/Sidebar";
import { UserProvider } from "../hooks/userUser";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <UserProvider>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </UserProvider>
  );
}
