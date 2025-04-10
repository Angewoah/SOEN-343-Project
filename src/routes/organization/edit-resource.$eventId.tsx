import { useState, useEffect } from 'react';
import { 
  createFileRoute, 
  useLoaderData
} from '@tanstack/react-router';
import { PlusIcon } from "@heroicons/react/24/solid";
import { 
  addResource,
  updateResource,
  fetchResourceFrom,
  deleteResource
} from '../../modules/resource/service';
import { DatumMenu } from '../../components/DatumMenu';
import { ResourceCard } from '../../components/ResourceCard';

export const Route = createFileRoute('/organization/edit-resource/$eventId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      resourceData: await fetchResourceFrom(params.eventId),
      eventId: params.eventId
    }
  }
})

function RouteComponent() {
  const { resourceData, eventId } = useLoaderData({ from: '/organization/edit-resource/$eventId' }) ?? [];
  const [resourceArr, setResourceArr] = useState(resourceData);
  
  return <DatumMenu title='Edit Resource' page='resource'>
    <div className="flex justify-start">
      <button
        type="button"
        className="font-medium text-md text-white bg-purple-500 hover:bg-purple-700 p-2 border-2 rounded-lg transition-colors text-center flex flex-row place-content-between items-center cursor-pointer w-32"
        onClick={async () => {
          const resource = await addResource(eventId, "unnamed", "invalid");
          if (resource) {
            setResourceArr([...resourceArr, resource]);
          
          }
        }}
      >
        <div className="w-full">Add Resource</div>
        <PlusIcon className="w-6"/>
      </button>
    </div>
    {resourceArr.length === 0 ? (
        <span className='text-sm text-gray-600 mt-4'>
          (no resources exist for this event)
        </span>
      ) : (
        resourceArr.map((resource, index) => (
          <ResourceCard
            resource={resource}
            id={index}
            key={resource.name+String(index)}
            onUpdate={(newResource) => updateResource(newResource)}
            onDelete={async (resourceId) => {
              if (await deleteResource(resourceId)) {
                setResourceArr(resourceArr.filter(resource => resource.id !== resourceId));
                
              }
            }}
          />
        ))
      )
    }
  </DatumMenu>
}
