import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";
import { useUser } from "../../hooks/useUser";
import { Sidebar } from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { Database } from "../../supabase/types";

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
      if (!user) {
        console.warn("No user provided to getUserProfile");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          throw new Error("Error fetching profile", error);
        }
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
    fetchProfile();
  }, [user]);

  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl ">welcome back :) {profile?.first_name}</h1>
      </div>
    </>
  );
}
