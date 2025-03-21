import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";

export const Route = createFileRoute("/organization/dashboard")({
  component: RouteComponent,
});

const supabase = getSupabaseClient();

const {
  data: { user },
} = await supabase.auth.getUser();

function RouteComponent() {
  return (
    <div className="w-full flex flex-col px-72 py-4">
      <h1 className="text-4xl ">welcome back :) {user?.id}</h1>
    </div>
  );
}
