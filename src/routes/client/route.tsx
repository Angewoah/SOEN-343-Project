import * as React from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ClientNavbar } from "../../components/ClientNavbar";

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

function ClientLayout() {
  return (
    <div className="client-layout flex flex-col h-screen bg-gradient-to-tl from-blue-600 via-blue-400 to-blue-400/10">
      <ClientNavbar />
      <div className="flex flex-1 rounded-t-4xl shadow-2xl shadow-black bg-white">
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
