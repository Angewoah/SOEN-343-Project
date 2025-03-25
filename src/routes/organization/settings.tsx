import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "../../components/Sidebar";

export const Route = createFileRoute("/organization/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Sidebar />
      <div className="w-full flex flex-col px-72 py-4">
        <h1 className="text-4xl ">Settings</h1>
      </div>
    </>
  );
}
