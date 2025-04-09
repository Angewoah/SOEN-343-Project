import { createFileRoute, useLoaderData, Link } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { ResourceCard } from "../../components/ResourceCard";
import { fetchEvents } from "../../modules/event/service";
import { fetchResourceFrom } from "../../modules/resource/service";
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
    
    // Sort events by title
    eventArr.sort((a, b) => a.title > b.title ? 1 : -1);
    
    return eventArr.map((event, index) => {
      return { event: event, resourceArr: resourceMat[index] }
    });
  }
});

const VISIBLE_RESOURCES = 3;
function RouteComponent() {
  const resourceSetArr = useLoaderData({ from: "/organization/payment" }) ?? [];
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4 ">
        <h1 className="text-4xl mb-4">Payment</h1>
        {resourceSetArr.map((entry) => {
          return <div className="relative flex flex-col p-4 border-2 border-neutral-300 rounded-lg my-2 bg-gradient-to-t from-white to-transparent z-10 overflow-hidden max-w-64 items-center">
            <div className="relative w-full">
              <div className="text-xl font-bold">{entry.event.title}</div>
              {entry.resourceArr.length === 0 ? <div className="text-gray-600 text-center">(no resources)</div> : <div>
                  <div>Resources:</div>
                  <ul className="list-inside list-disc pr-2 w-full">
                    {entry.resourceArr.slice(0, VISIBLE_RESOURCES).map((resource, index) => {
                      return <li className="" key={index}>
                        {resource.name}{index == entry.resourceArr.length-1
                          && entry.resourceArr.length <= VISIBLE_RESOURCES ? "." : ","}
                      </li>
                    })}
                  </ul>
                  {entry.resourceArr.length > VISIBLE_RESOURCES && (
                    <div className="absolute bottom-0 left-0 w-full h-18 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 rounded-lg"/>
                  )}
                </div>
              }
            </div>
            <Link
              to="/organization/resource/$eventId"
              params={{eventId: entry.event.id}}
              className="font-medium text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center mt-4 px-6"
            >
              Edit
            </Link>
          </div>
        })}
        
      </div>
    </>
  );
}
