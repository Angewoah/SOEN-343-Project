import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { OrgNavbar } from "../../components/OrgNavbar";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "../../modules/event/service";
import { useUser } from "../../hooks/useUser";
import { useEffect, useMemo, useState } from "react";
import { Database } from "../../supabase/types";
import { getUserProfile } from "../../modules/profile/service";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../supabase/client";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"] & {
  venues:
    | (Database["public"]["Tables"]["venues"]["Row"] & {
        venue_timeslots: Database["public"]["Tables"]["venue_timeslots"]["Row"][];
      })
    | null;
};
type VenueTimeslot = Database["public"]["Tables"]["venue_timeslots"]["Row"];
type Venue = Database["public"]["Tables"]["venues"]["Row"];
type Speaker = Database["public"]["Tables"]["bookings"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};
type CreateEventFormData = z.infer<typeof CreateEventSchema>;

const CreateEventSchema = z.object({
  venueId: z.string().min(1, { message: "Please select a venue" }),
});

export const Route = createFileRoute("/organization/complete-event/$eventId")({
  component: CompleteEventPage,
});

function CompleteEventPage() {
  const { user, isLoading, signOut } = useUser();
  const { eventId } = useParams({ strict: false });
  const supabase = getSupabaseClient();
  const [profiles, setProfiles] = useState<Profile[] | null>([]);
  const [speakers, setSpeakers] = useState<Speaker[] | null>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [searchText, setSearchText] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [timeslots, setTimeslots] = useState<VenueTimeslot[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedTimeslot, setSelectedTimeslot] =
    useState<VenueTimeslot | null>(null);
  const [isAddingSpeaker, setIsAddingSpeaker] = useState(false);
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const eventIdNumber = Number(eventId);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(
            `
            *,
            venues (
              *,
              venue_timeslots (
                *
              )
            )
          `
          )
          .eq("id", eventIdNumber)
          .single();

        if (error) throw error;
        setEvent(data || null);
      } catch (err) {
        console.error("Error fetching event", err);
      }
    }

    fetchEvent();
  }, [eventIdNumber]);
  useEffect(() => {
    async function fetchVenues() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .order("name");

        if (error) throw error;
        setVenues(data || []);
      } catch (err) {
        console.error("Error fetching venues", err);
      }
    }

    fetchVenues();
  }, []);

  useEffect(() => {
    async function fetchSpeakers() {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            profiles:user_id (*)
          `
          )
          .eq("event_id", eventIdNumber);

        if (error) {
          console.error("Error fetching speaker profiles:", error);
          throw new Error("Error fetching speaker profiles", error);
        }

        setSpeakers(data);
      } catch (error) {
        console.error("Error fetching speaker profiles:", error);
      }
    }
    fetchSpeakers();
  }, [speakers, eventIdNumber]);

  useEffect(() => {
    async function fetchAvailableProfiles() {
      if (!user) return null;

      try {
        const { data: bookedUsers, error: bookedError } = await supabase
          .from("bookings")
          .select("user_id")
          .eq("event_id", eventIdNumber);

        if (bookedError) {
          console.error("Error fetching booked users:", bookedError);
          throw bookedError;
        }

        const bookedUserIds =
          bookedUsers?.map((booking) => booking.user_id) || [];

        if (bookedUserIds.length === 0) {
          const { data, error } = await supabase.from("profiles").select("*");

          if (error) {
            console.error("Error fetching all profiles:", error);
            throw error;
          }

          setProfiles(data ?? []);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .not("id", "in", `(${bookedUserIds.join(",")})`);

        if (error) {
          console.error("Error fetching available profiles:", error);
          throw error;
        }

        setProfiles(data ?? []);
      } catch (error) {
        console.error("Error in fetchAvailableProfiles:", error);
      }
    }

    fetchAvailableProfiles();
  }, [speakers, eventIdNumber]);

  useEffect(() => {
    const fetchTimeslots = async () => {
      setTimeslots([]);
      if (!selectedVenue) return;
      try {
        const { data, error } = await supabase
          .from("venue_timeslots")
          .select("*")
          .eq("venue_id", selectedVenue.id)
          .eq("is_available", true)
          .order("start_time", { ascending: true });

        if (error) throw error;

        setTimeslots(data || []);
      } catch (error) {
        console.error("Error fetching timeslots:", error);
      }
    };

    fetchTimeslots();
  }, [selectedVenue]);

  const filteredProflies = useMemo(() => {
    if (!searchText) return profiles ?? [];

    return (profiles ?? []).filter(
      (profile) =>
        profile.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        profile.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, profiles]);

  const filteredVenues = useMemo(() => {
    if (!searchText) return venues ?? [];

    return (venues ?? []).filter(
      (venue) =>
        venue.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, venues]);

  async function handleSpeakerSelect(profile: Profile) {
    if (!profile) return;
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: profile.id,
        event_id: eventIdNumber,
        registration_status: "confirmed",
        type: "speaker",
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error inserting booking", error);
    } finally {
      setIsAddingSpeaker(false);
      setSearchText("");
    }
  }

  // Venue selection code
  async function handleVenueSelect(venue: Venue) {
    setSelectedVenue(venue);
    setIsAddingVenue(false);
    setSearchText("");
  }

  async function updateEventVenue(venueId: number) {
    if (!eventId) return;
    try {
      const { error } = await supabase
        .from("events")
        .update({ venue_id: venueId })
        .eq("id", eventIdNumber);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding venue", error);
    } finally {
      setIsAddingSpeaker(false);
      setSearchText("");
    }
  }

  async function handleDeleteVenue() {
    if (selectedTimeslot) {
      handleTimeslotDelete(selectedTimeslot!.id);
    }
    setSelectedVenue(null);
    setIsAddingVenue(false);
    setSearchText("");
  }

  async function handleTimeslotSelect(
    timeslot: VenueTimeslot,
    venueId: number,
    venueTimeslotId: number
  ) {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({ venue_timeslot_id: venueTimeslotId })
        .eq("id", eventIdNumber);

      updateEventVenue(venueId);
      updateTimeslotStatusFalse(venueTimeslotId);
      setSelectedTimeslot(timeslot);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding timeslot", error);
    } finally {
      setIsAddingSpeaker(false);
      setSearchText("");
    }
  }

  async function updateTimeslotStatusFalse(venueTimeslotId: number) {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from("venue_timeslots")
        .update({ is_available: false })
        .eq("id", venueTimeslotId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating timeslot", error);
    }
  }

  async function updateTimeslotStatusTrue(venueTimeslotId: number) {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from("venue_timeslots")
        .update({ is_available: true })
        .eq("id", venueTimeslotId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating timeslot", error);
    }
  }

  async function handleTimeslotDelete(venueTimeslotId: number) {
    if (!eventIdNumber) return;
    if (venueTimeslotId) {
      updateTimeslotStatusTrue(venueTimeslotId);
    }

    try {
      const { error } = await supabase
        .from("events")
        .update({ venue_id: null, venue_timeslot_id: null })
        .eq("id", eventIdNumber);

      setSelectedVenue(null);
      setSelectedTimeslot(null);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding venue", error);
    } finally {
      setIsAddingSpeaker(false);
      setSearchText("");
    }
  }

  async function handleDeleteSpeaker(profileId: string | undefined) {
    if (!profileId) return;
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("user_id", profileId);

      if (error) throw error;
    } catch (error) {
      console.error("Error inserting booking", error);
    } finally {
      setIsAddingSpeaker(false);
      setSearchText("");
    }
  }

  async function makeEventPublic(eventId: number) {
    if (!eventId) return;
    if (!selectedTimeslot || !speakers) {
      setError(
        "Must select a speaker and a timeslot before making the event public"
      );
    } else {
      try {
        const { error } = await supabase
          .from("events")
          .update({ status: "active" })
          .eq("id", eventId);

        if (error) throw error;

        navigate({ to: "/organization/events/overview" });
      } catch (error) {
        console.error("Error inserting booking", error);
      } finally {
        setIsAddingSpeaker(false);
        setSearchText("");
      }
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(CreateEventSchema),
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-20 w-full flex bg-white items-center rounded-t-4xl border-b-1 border-b-neutral-200">
        <Link
          to="/organization/events/overview"
          className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-mono ml-4 mr-2">Complete Event</h1> -{" "}
        <h1 className="text-lg font-mono ml-2">{event?.title}</h1>
      </div>

      <div className="w-full max-w-1/4 py-16">
        <div className="flex flex-col gap-2">
          <div>
            <label
              htmlFor="speaker"
              className="block text-2xl font-bold text-gray-700"
            >
              Speakers
            </label>
            <div className="flex flex-col gap-4 mt-4">
              {speakers?.map((speaker) => (
                <div key={speaker.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {speaker.profiles?.first_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {speaker.profiles?.email}
                      </div>
                    </div>
                    <button
                      className="cursor-pointer"
                      onClick={() => handleDeleteSpeaker(speaker.profiles?.id)}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isAddingSpeaker ? (
            <button
              id="speaker"
              className="w-full bg-neutral-100/50 p-2 rounded-lg mt-2 text-neutral-400 cursor-pointer flex gap-2 border-2 border-neutral-300"
              onClick={() => setIsAddingSpeaker(true)}
            >
              <PlusIcon className="w-6 h-6" /> Add a speaker
            </button>
          ) : (
            <div className="relative flex items-center justify-center">
              <input
                type="text"
                placeholder="Search speakers by name or email"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-neutral-100/50 p-2 rounded-lg mt-2 flex gap-2 border-2 border-neutral-300 focus:outline-blue-300 "
              />
              <button
                type="button"
                onClick={() => setIsAddingSpeaker(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 pt-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div>
          {isAddingSpeaker && (
            <>
              {filteredProflies.length > 0 ? (
                <div className="w-full flex flex-col bg-neutral-100/50 p-2 rounded-lg mt-2 cursor-pointer gap-2 border-2 border-neutral-300 ">
                  {filteredProflies.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleSpeakerSelect(profile)}
                      className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer flex items-center"
                    >
                      <div>
                        <div className="font-medium">{profile.first_name}</div>
                        <div className="text-sm text-gray-500">
                          {profile.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-center text-gray-500">
                  {searchText ? "No profiles found" : "Start typing to search"}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="block text-2xl font-bold text-gray-700 mt-8">
            Select a Venue
          </h2>
          <div className="flex flex-col gap-4 mt-4">
            {(event?.venues || selectedVenue) && (
              <div key={event?.venues?.id || selectedVenue?.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {event?.venues?.name || selectedVenue?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event?.venues?.address || selectedVenue?.address}
                    </div>
                  </div>
                  <button
                    className="cursor-pointer"
                    onClick={() => handleDeleteVenue()}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {event?.venues == null &&
            selectedVenue == null &&
            (!isAddingVenue ? (
              <button
                id="speaker"
                className="w-full bg-neutral-100/50 p-2 rounded-lg mt-2 text-neutral-400 cursor-pointer flex gap-2 border-2 border-neutral-300"
                onClick={() => setIsAddingVenue(true)}
              >
                <PlusIcon className="w-6 h-6" /> Select a Venue
              </button>
            ) : (
              <div className="relative flex items-center justify-center">
                <input
                  type="text"
                  placeholder="Search venues by name or address"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-neutral-100/50 p-2 rounded-lg mt-2 flex gap-2 border-2 border-neutral-300 focus:outline-blue-300"
                />
                <button
                  type="button"
                  onClick={() => setIsAddingVenue(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 pt-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
        <div>
          {isAddingVenue && (
            <>
              {filteredVenues.length > 0 && selectedVenue == null ? (
                <div className="w-full flex flex-col bg-neutral-100/50 p-2 rounded-lg mt-2 cursor-pointer gap-2 border-2 border-neutral-300 ">
                  {filteredVenues.map((venue) => (
                    <div
                      key={venue.id}
                      onClick={() => handleVenueSelect(venue)}
                      className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer flex items-center"
                    >
                      <div>
                        <div className="font-medium">{venue.name}</div>
                        <div className="text-sm text-gray-500">
                          {venue.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-center text-gray-500">
                  {searchText ? "No venues found" : "Start typing to search"}
                </div>
              )}
            </>
          )}
        </div>

        {selectedVenue != null && (
          <div className="flex flex-col">
            <h2 className="block text-2xl font-bold text-gray-700 mt-8">
              Select a Timeslot
            </h2>

            {event?.venue_timeslot_id == null && selectedTimeslot == null ? (
              timeslots.length > 0 ? (
                <div className="w-full flex flex-col bg-neutral-100/50 p-2 rounded-lg mt-2 cursor-pointer gap-2 border-2 border-neutral-300">
                  {timeslots.map((timeslot) => (
                    <div
                      key={timeslot.id}
                      onClick={() =>
                        handleTimeslotSelect(
                          timeslot,
                          selectedVenue.id,
                          timeslot.id
                        )
                      }
                      className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer flex items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {timeslot.start_time && timeslot.end_time ? (
                            <>
                              {new Date(timeslot.start_time).toLocaleString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                              {" - "}
                              {new Date(timeslot.end_time).toLocaleString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </>
                          ) : (
                            "Invalid Timeslot"
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {timeslot.start_time && timeslot.end_time
                            ? (() => {
                                const start = new Date(timeslot.start_time);
                                const end = new Date(timeslot.end_time);
                                const durationMinutes = Math.round(
                                  (end.getTime() - start.getTime()) / 60000
                                );
                                return `${durationMinutes} min duration`;
                              })()
                            : "No duration available"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-center text-gray-500">
                  <h3>No timeslots found</h3>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                {(event?.venue_timeslot_id || selectedTimeslot) && (
                  <div>
                    <div className="font-medium flex justify-between items-center">
                      {selectedTimeslot ? (
                        selectedTimeslot.start_time &&
                        selectedTimeslot.end_time ? (
                          <>
                            {new Date(
                              selectedTimeslot.start_time
                            ).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                            {" - "}
                            {new Date(selectedTimeslot.end_time).toLocaleString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </>
                        ) : (
                          "Invalid Timeslot"
                        )
                      ) : (
                        "No Timeslot Selected"
                      )}
                      <button
                        className="cursor-pointer"
                        onClick={() => handleDeleteVenue()}
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTimeslot &&
                      selectedTimeslot.start_time &&
                      selectedTimeslot.end_time
                        ? (() => {
                            const start = new Date(selectedTimeslot.start_time);
                            const end = new Date(selectedTimeslot.end_time);
                            const durationMinutes = Math.round(
                              (end.getTime() - start.getTime()) / 60000
                            );
                            return `${durationMinutes} min duration`;
                          })()
                        : "No duration available"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <button
            type="button"
            className="w-full text-md font-medium bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none cursor-pointer mt-8"
            onClick={() => makeEventPublic(eventIdNumber)}
          >
            Make event public
          </button>
        </div>
      </div>
    </div>
  );
}
