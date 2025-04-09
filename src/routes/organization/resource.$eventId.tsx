import { Sidebar } from "../../components/Sidebar";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getSupabaseClient } from "../../supabase/client"
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router'
import { 
  addResource, 
  fetchResourceFrom 
} from "../../modules/resource/service";

export const Route = createFileRoute('/organization/resource/$eventId')({
  component: RouteComponent,
})

function RouteComponent() {
  const eventData = useLoaderData({ from: '/organization/resource/$eventId' }) ?? [];
  
  console.log(eventData);
  
  return <div className="w-full flex flex-col items-center">
    <div className="h-20 w-full flex bg-white items-center rounded-t-4xl border-b-1 border-b-neutral-200">
      <Link
        to="/organization/payment"
        className="px-4 cursor-pointer border-r-1 border-r-neutral-900"
      >
        <XMarkIcon className="w-6 h-6" />
      </Link>
      <h1 className="text-lg font-mono ml-4">Edit Resource</h1>
    </div>
  </div>
}
