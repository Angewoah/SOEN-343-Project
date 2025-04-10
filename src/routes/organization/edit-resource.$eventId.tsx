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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Function to save all resources
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      // Save each resource in parallel
      await Promise.all(
        resourceArr.map(resource => updateResource(resource))
      );
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving resources:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <DatumMenu title='Edit Resource' page='resource'>
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 space-y-6">
        {/* Header with buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Resources</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-colors"
              onClick={async () => {
                const resource = await addResource(eventId, "unnamed", "invalid");
                if (resource) {
                  setResourceArr([...resourceArr, resource]);
                }
              }}
            >
              <PlusIcon className="w-5 h-5"/>
              <span>Add Resource</span>
            </button>
            
            {/* Save All Button */}
            <button
              type="button"
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-md transition-colors ${
                isSaving 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : saveSuccess 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save All</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Resources list */}
        <div className="space-y-4">
          {resourceArr.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No resources exist for this event</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Resource" to create your first resource</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resourceArr.map((resource, index) => (
                <div 
                  key={resource.name+String(index)}
                  className="transition-all duration-200 ease-in-out"
                >
                  <ResourceCard
                    resource={resource}
                    id={index}
                    onUpdate={(newResource) => {
                      // Update the resource in the local state without saving to the server
                      const updatedResources = [...resourceArr];
                      const index = updatedResources.findIndex(r => r.id === newResource.id);
                      if (index !== -1) {
                        updatedResources[index] = newResource;
                        setResourceArr(updatedResources);
                      }
                    }}
                    onDelete={async (resourceId) => {
                      if (await deleteResource(resourceId)) {
                        setResourceArr(resourceArr.filter(resource => resource.id !== resourceId));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DatumMenu>
  );
}