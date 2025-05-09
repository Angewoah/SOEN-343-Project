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
  const [userRole, setUserRole] = useState("attendee");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  const supabase = getSupabaseClient();

  const AVAILABLE_INTERESTS = ["educational", "entertainment", "networking"];

  const getInterestTagColor = (interest: string) => {
    const isSelected = selectedInterests.includes(interest);
    switch (interest) {
      case 'educational':
        return isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'entertainment':
        return isSelected 
          ? 'bg-purple-500 text-white' 
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'networking':
        return isSelected 
          ? 'bg-green-500 text-white' 
          : 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return isSelected 
          ? 'bg-gray-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const toggleInterest = (newInterest: string) => 
  {
    if(selectedInterests.includes(newInterest)){
      setSelectedInterests(selectedInterests.filter((interest) => interest != newInterest));
    }
    else{
      setSelectedInterests( [...selectedInterests, newInterest] );
    }
  }

  const signUp = async () => {

    const userInterests = selectedInterests.join();

    const signUpData = {
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: userRole,
          interests: userInterests
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
        userRole == "organizer"
          ? navigate({ to: "/organization/events/inactive" })
          : navigate({ to: "/client/events" });
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
          <h3 className="text-left w-full mb-1">I am joining as</h3>
          <div className="flex gap-4 w-full mb-6">
            <div
              className={`flex-1 p-3 border rounded cursor-pointer text-center ${
                userRole === "attendee"
                  ? "bg-purple-100 border-purple-400"
                  : "border-neutral-300 hover:border-purple-300"
              }`}
              onClick={() => setUserRole("attendee")}
            >
              Attendee
            </div>
            <div
              className={`flex-1 p-3 border rounded cursor-pointer text-center ${
                userRole === "organizer"
                  ? "bg-purple-100 border-purple-400"
                  : "border-neutral-300 hover:border-purple-300"
              }`}
              onClick={() => setUserRole("organizer")}
            >
              Organizer
            </div>
          </div>
          <h3 className="text-left w-full mb-1">I am interested in</h3>
          <div className="flex gap-4 w-full mb-6">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button" 
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer ${getInterestTagColor(interest)}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

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
