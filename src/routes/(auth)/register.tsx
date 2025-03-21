import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getSupabaseClient } from "../../supabase/client";

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const supabase = getSupabaseClient();

  const signUp = async () => {
    const signUpData = {
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    };

    console.log("Sign-up data being sent:", signUpData);

    try {
      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) {
        setError("Error");
        console.error("Error signing up:", error.message);
      } else {
        console.log("Sign-up and profile update successful");
        navigate({ to: "/organization/dashboard" });
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
          <div className="w-5/6 h-5/6 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 opacity-50 blur-2xl rounded-4xl mt-16"></div>
        </div>

        <div className="relative flex flex-col items-start w-1/3 rounded-3xl bg-white mb-12 mx-60 px-16 shadow-2xl pb-12">
          <h1 className="text-4xl font-bold my-8">
            Create your stitch account
          </h1>

          <h3 className="text-left w-full mb-1">First name</h3>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mb-4 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />

          <h3 className="text-left w-full mb-1">Last name</h3>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mb-4 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />
          <h3 className="text-left w-full mb-1">Email</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />

          <h3 className="text-left w-full mb-1">Password</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-3 border-1 border-neutral-300 rounded w-full focus:outline-none focus:ring-1 focus:ring-neutral-500 text-black"
          />

          <button
            className="text-lg tracking-wide w-full bg-purple-400 text-white px-6 py-3 rounded-xl shadow-md hover:bg-purple-300 transition-colors cursor-pointer"
            onClick={signUp}
          >
            Sign Up
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="flex flex-col w-full items-center">
            <h3 className="text-lg mt-12">
              Already have an account?{" "}
              <Link to="/login" className="text-lg underline">
                Sign in here
              </Link>
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}
