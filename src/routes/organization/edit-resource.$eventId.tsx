import { getSupabaseClient } from "../../supabase/client"
import { 
  createFileRoute, 
  useLoaderData, 
  useLocation 
} from '@tanstack/react-router'
import { 
  addResource, 
  fetchResourceFrom 
} from "../../modules/resource/service";
import { DatumMenu } from '../../components/DatumMenu';


export const Route = createFileRoute('/organization/edit-resource/$eventId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return await fetchResourceFrom(params.eventId);
  }
})

function RouteComponent() {
  const eventData = useLoaderData({ from: '/organization/edit-resource/$eventId' }) ?? [];
  return <DatumMenu title="Edit Resource" page="resource">
  </DatumMenu>
}
