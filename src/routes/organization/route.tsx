import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { OrgNavbar } from "../../components/OrgNavbar";
import { supabase } from "../../supabase/client";

export const Route = createFileRoute("/organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-tl from-purple-600 via-purple-400 to-purple-400/10">
      <OrgNavbar />
      <div className="w-full flex flex-1 rounded-t-4xl shadow-2xl shadow-black bg-white">
        <Outlet />
      </div>
    </div>
  );
}
