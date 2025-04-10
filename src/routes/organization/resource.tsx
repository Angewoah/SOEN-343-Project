import { createFileRoute, useLoaderData, Link } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { ResourceCard } from "../../components/ResourceCard";
import { fetchEvents } from "../../modules/event/service";
import { fetchResourceFrom } from "../../modules/resource/service";
import { getSupabaseClient } from "../../supabase/client";
import { DocumentTextIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/organization/resource")({
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
  const resourceSetArr = useLoaderData({ from: "/organization/resource" }) ?? [];
  
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-8 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Event Resources</h1>
          <p className="text-gray-600 mt-2">Manage resources for your events</p>
        </div>
        
        <div className="space-y-6">
          {resourceSetArr.map((entry, index) => (
            <div 
              key={index}
              className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
            >
              <div className="bg-purple-50 p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-purple-900 truncate">{entry.event.title}</h2>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <Link
                  to="/organization/edit-resource/$eventId"
                  params={{ eventId: entry.event.id.toString() }}
                  className="inline-flex items-center justify-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Edit Resources
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {resourceSetArr.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500">Create events to manage their resources</p>
          </div>
        )}
      </div>
    </>
  );
}