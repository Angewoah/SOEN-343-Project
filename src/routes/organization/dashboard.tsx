import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";
import { useUser } from "../../hooks/useUser";
import { Sidebar } from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { Database } from "../../supabase/types";
import { getUserProfile } from "../../modules/profile/service";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/organization/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useUser();
  useEffect(() => {
    async function fetchProfile() {
      const profile = await getUserProfile(user!.id);
      setProfile(profile ?? null);
    }
    fetchProfile();
  });

  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl ">welcome back {profile?.first_name}</h1>
        <h2 className="font-medium mt-12">Coming next sprint !</h2>
      </div>
    </>
  );
}
