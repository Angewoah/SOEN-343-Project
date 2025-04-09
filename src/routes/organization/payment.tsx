import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { ResourceCard } from "../../components/ResourceCard";
import { fetchEvents } from "../../modules/event/service";
import { 
  addResource, 
  fetchResourceFrom 
} from "../../modules/resource/service";
import { getSupabaseClient } from "../../supabase/client";

export const Route = createFileRoute("/organization/payment")({
  component: RouteComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    
    if (error || !data.user) {
      return [];
    }

    const eventArr = await fetchEvents(data.user);
    const resourceMat = await Promise.all(
      eventArr.map(async (event) => {
        return fetchResourceFrom(event.id);
      })
    );
    
    return eventArr.map((event, index) => {
      return { event: event, resourceArr: resourceMat[index] }
    });
  }
});

function RouteComponent() {
  const eventArr = useLoaderData({ from: "/organization/payment" }) ?? [];
  
  console.log(eventArr);
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl">Payment</h1>
      </div>
    </>
  );
}
