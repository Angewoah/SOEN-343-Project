import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { fetchEvents } from "../../modules/event/service";
import { addResource } from "../../modules/resource/service";
import { getSupabaseClient } from "../../supabase/client";

export const Route = createFileRoute("/organization/payment")({
  component: RouteComponent,
  loader: async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    
    if (error || !data.user) {
      return [];
    }

    const eventArr = await fetchEvents(data.user);
    
    return eventArr;
  }
});

function RouteComponent() {
  const eventArr = useLoaderData({ from: "/organization/payment" }) ?? [];
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <button 
          type="button" 
          className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center flex flex-row place-content-between items-center cursor-pointer w-32"
          onClick={() => {
            const id = addResource(41, 'test', 'test_status');
          }}
        >
          Test
        </button>
      </div>
    </>
  );
}
