import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { OrgNavbar } from "../../components/OrgNavbar";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "../../modules/event/service";
import { useUser } from "../../hooks/useUser";
import { useEffect, useState } from "react";
import { Database } from "../../supabase/types";
import { getUserProfile } from "../../modules/profile/service";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../supabase/client";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const CreateEventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  duration: z.coerce
    .number()
    .int()
    .positive({ message: "Duration must be a positive number" }),
  maxAttendees: z.coerce
    .number()
    .int()
    .positive({ message: "Max attendees must be a positive number" }),
});

type CreateEventFormData = z.infer<typeof CreateEventSchema>;

export const Route = createFileRoute("/organization/create-event")({
  component: CreateEventsPage,
});

function CreateEventsPage() {
  const { user, isLoading, signOut } = useUser();
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(CreateEventSchema),
  });

  const onSubmit = (data: CreateEventFormData) => {
    if (!user) return;
    try {
      createEvent(
        user?.id,
        data.title,
        data.description,
        data.duration,
        data.maxAttendees
      );

      reset();
      console.log("Event created successfully", data);
      navigate({ to: "/organization/events" });
    } catch (error) {
      console.error("Failed to create event", error);
    }
  };
  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-20 w-full flex bg-white items-center rounded-t-4xl border-b-1 border-b-neutral-200">
        <Link
          to="/organization/events"
          className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-mono ml-4">Create New Event</h1>
      </div>

      <div className="w-full max-w-1/4 py-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-y-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">Organizer</h2>
              <h2 className="text-sm mt-2 font-medium text-gray-700">
                {profile?.first_name} {profile?.last_name}
              </h2>
            </div>
            <div>
              <label
                htmlFor="title"
                className="block text-2xl font-bold text-gray-700"
              >
                Event Title
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm  focus:outline-blue-300"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-2xl font-bold text-gray-700"
              >
                Event Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm  focus:outline-blue-300"
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-2xl font-bold text-gray-700"
                >
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                  className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm  focus:outline-blue-300"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="maxAttendees"
                  className="block text-2xl font-bold text-gray-700"
                >
                  Max Attendees
                </label>
                <input
                  id="maxAttendees"
                  type="number"
                  {...register("maxAttendees", { valueAsNumber: true })}
                  className="mt-2 p-1 block w-full rounded-md border border-neutral-300 shadow-sm  focus:outline-blue-300"
                />
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.maxAttendees.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full text-md font-medium bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none cursor-pointer"
              >
                Create Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
