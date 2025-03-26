import { createFileRoute, Link } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";
import { BellIcon, UserIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/organization/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl ">Settings</h1>
        <div>
          <h2 className="text-2xl font-medium mt-8 mb-4">Personal Settings</h2>
          <div className="flex gap-24 justify-between">
            <Link
              to="/organization/settings/user"
              className="flex flex-1 rounded-lg p-2 hover:bg-neutral-200 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <UserIcon className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-purple-600">Profile</h3>
                </div>
                <h4 className="text-sm">View and edit personal information</h4>
              </div>
            </Link>
            <Link
              to="/organization/settings/notifications"
              className="flex flex-1 hover:bg-neutral-200 transition-colors rounded-lg p-2"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <BellIcon className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-purple-600">
                    Communication Preferences
                  </h3>
                </div>
                <h4 className="text-sm">
                  Customize the emails, SMS, and other push notifications
                </h4>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
