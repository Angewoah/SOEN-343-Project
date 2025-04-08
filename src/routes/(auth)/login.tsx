import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getSupabaseClient } from "../../supabase/client";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = getSupabaseClient();

  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const signIn = async () => {
    try {
      const { data: signInData, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError("Invalid email or password");
        console.error("Error signing in:", error.message);
      } else {
        console.log("Sign-in successful");

        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user data:", userError.message);
        } else {
          const userRole = userData.user.user_metadata?.role || "attendee";

          // Navigate based on user role
          if (userRole === "organizer") {
            navigate({ to: "/organization/dashboard" });
          } else {
            navigate({ to: "/client/events" });
          }

          console.log(`Navigated to ${userRole} dashboard`);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="flex flex-row h-screen">
      <main className="flex flex-col items-center justify-center w-full relative">
        <div className="absolute inset-0 flex items-start justify-center">
          <div className="w-5/6 h-5/6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50 blur-2xl rounded-4xl mt-16"></div>
        </div>

        <div className="relative flex flex-col items-start w-1/3 rounded-3xl bg-white mb-12 mx-60 px-16 shadow-2xl pb-12">
          <h1 className="text-4xl font-bold my-8">Sign in to your account</h1>

          <h3 className="text-left w-full mb-1">Email</h3>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />

          <h3 className="text-left w-full mb-1">Password</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-12 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />

          <button
            className="text-xl tracking-wide w-full bg-purple-400 text-white px-6 py-3 rounded-xl shadow-md hover:bg-purple-300 transition-colors cursor-pointer"
            onClick={signIn}
          >
            Sign In
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="flex flex-col w-full items-center">
            <h3 className="text-lg mt-12">
              New to stitch?{" "}
              <Link to="/register" className="text-lg underline">
                Create account
              </Link>
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}
