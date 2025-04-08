import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { OrgNavbar } from "../../components/OrgNavbar";
import { ProgressSteps } from "../../components/ProgressSteps";
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

const steps = [
  { name: "Basic Info", description: "Create your event" },
  { name: "Complete Setup", description: "Add speakers & schedule" },
];

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

        navigate({ to: "/organization/events/all" });
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
          to="/organization/events/all"
          className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-mono ml-4 mr-2">Complete Event</h1> -{" "}
        <h1 className="text-lg font-mono ml-2">{event?.title}</h1>
      </div>
  
      <div className="w-full">
        <ProgressSteps 
          currentStep={2} 
          totalSteps={2} 
          steps={steps} 
        />
      </div>
  
      <div className="max-w-3xl w-full pb-16 pt-8">
        <div className="space-y-8">
          {/* Speakers Section */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full inline-flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </span>
              Speakers
            </h2>
            <div className="ml-11 space-y-4">
              {speakers && speakers.length > 0 ? (
                <div className="space-y-3">
                  {speakers?.map((speaker) => (
                    <div key={speaker.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                      <div>
                        <div className="font-medium">{speaker.profiles?.first_name} {speaker.profiles?.last_name}</div>
                        <div className="text-sm text-gray-500">{speaker.profiles?.email}</div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteSpeaker(speaker.profiles?.id)}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No speakers added yet</p>
              )}
              
              {!isAddingSpeaker ? (
                <button
                  id="speaker"
                  className="flex items-center px-4 py-2 mt-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                  onClick={() => setIsAddingSpeaker(true)}
                >
                  <PlusIcon className="w-5 h-5 mr-1 text-gray-500" /> Add a speaker
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search speakers by name or email"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingSpeaker(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
  
                  {isAddingSpeaker && filteredProflies.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                      {filteredProflies.map((profile) => (
                        <div
                          key={profile.id}
                          onClick={() => handleSpeakerSelect(profile)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isAddingSpeaker && searchText && filteredProflies.length === 0 && (
                    <div className="text-center p-3 bg-gray-50 text-gray-500 rounded-md">
                      No matching profiles found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
  
          {/* Venue Section */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full inline-flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              Venue Selection
            </h2>
            <div className="ml-11 space-y-4">
              {(event?.venues || selectedVenue) ? (
                <div className="p-3 bg-white rounded-md border border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{event?.venues?.name || selectedVenue?.name}</div>
                    <div className="text-sm text-gray-500">{event?.venues?.address || selectedVenue?.address}</div>
                    <div className="text-xs text-gray-400 mt-1">Capacity: {event?.venues?.capacity || selectedVenue?.capacity} attendees</div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => handleDeleteVenue()}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 italic">No venue selected</p>
              )}
              
              {event?.venues == null && selectedVenue == null && (
                !isAddingVenue ? (
                  <button
                    className="flex items-center px-4 py-2 mt-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    onClick={() => setIsAddingVenue(true)}
                  >
                    <PlusIcon className="w-5 h-5 mr-1 text-gray-500" /> Select a Venue
                  </button>
                ) : (
                  <div className="mt-4 space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search venues by name or address"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddingVenue(false)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
  
                    {isAddingVenue && filteredVenues.length > 0 && selectedVenue == null && (
                      <div className="bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                        {filteredVenues.map((venue) => (
                          <div
                            key={venue.id}
                            onClick={() => handleVenueSelect(venue)}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
                          >
                            <div className="w-full">
                              <div className="font-medium">{venue.name}</div>
                              <div className="text-sm text-gray-500">{venue.address}</div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">Capacity: {venue.capacity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
  
          {/* Timeslot Section */}
          {(selectedVenue || event?.venues) && (
            <div className="bg-purple-50 p-6 rounded-lg shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full inline-flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Schedule
              </h2>
              <div className="ml-11 space-y-4">
                {event?.venue_timeslot_id || selectedTimeslot ? (
                  <div className="p-3 bg-white rounded-md border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {selectedTimeslot && selectedTimeslot.start_time && selectedTimeslot.end_time ? (
                          <>
                            {new Date(selectedTimeslot.start_time).toLocaleString(
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
                            {" to "}
                            {new Date(selectedTimeslot.end_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </>
                        ) : (
                          "Selected Timeslot"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedTimeslot && selectedTimeslot.start_time && selectedTimeslot.end_time && (
                          (() => {
                            const start = new Date(selectedTimeslot.start_time);
                            const end = new Date(selectedTimeslot.end_time);
                            const durationMinutes = Math.round(
                              (end.getTime() - start.getTime()) / 60000
                            );
                            return `${durationMinutes} minutes duration`;
                          })()
                        )}
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => selectedTimeslot?.id && handleTimeslotDelete(selectedTimeslot.id)}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  timeslots.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                      {timeslots.map((timeslot) => (
                        <div
                          key={timeslot.id}
                          onClick={() => handleTimeslotSelect(timeslot, selectedVenue!.id, timeslot.id)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">
                            {timeslot.start_time && timeslot.end_time && (
                              <>
                                {new Date(timeslot.start_time).toLocaleString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                                {" to "}
                                {new Date(timeslot.end_time).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {timeslot.start_time && timeslot.end_time && (
                              (() => {
                                const start = new Date(timeslot.start_time);
                                const end = new Date(timeslot.end_time);
                                const durationMinutes = Math.round(
                                  (end.getTime() - start.getTime()) / 60000
                                );
                                return `${durationMinutes} minutes duration`;
                              })()
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-md text-gray-500">
                      No available timeslots for this venue
                    </div>
                  )
                )}
              </div>
            </div>
          )}
  
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {/* Submit Button Section */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate({ to: "/organization/events/all" })}
              className="order-2 sm:order-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => makeEventPublic(eventIdNumber)}
              className="order-1 sm:order-2 py-2 px-6 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none transition-colors"
            >
              Make Event Public
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
