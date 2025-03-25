import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { getSupabaseClient } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { useUser } from "../hooks/useUser";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { user, isLoading, signOut } = useUser();

  const supabase = getSupabaseClient();

  return (
    <div className="flex gap-x-8">
      {user ? (
        <Link to="/organization/dashboard">Go to organization</Link>
      ) : (
        <Link to="/login">Go to login</Link>
      )}
    </div>
  );
}
