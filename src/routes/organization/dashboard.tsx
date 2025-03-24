import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";
import { useUser } from "../../hooks/userUser";

export const Route = createFileRoute("/organization/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = getSupabaseClient();

  const { user, isLoading, signOut } = useUser();
  return (
    <div className="w-full flex flex-col px-72 py-4">
      <h1 className="text-4xl ">welcome back :) {user?.id}</h1>
    </div>
  );
}
