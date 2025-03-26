import { Link } from "@tanstack/react-router";

export function EventsNav() {
  return (
    <>
      <div className="flex text-lg w-full gap-8 mt-4 ">
        <Link
          to="/organization/events/overview"
          activeProps={{
            className:
              "font-medium text-purple-600/80 pb-3 border-b-2 border-b-purple-600/80",
          }}
          activeOptions={{ exact: false }}
          className="text-base hover:bg-neutral-200/70 transition-colors"
        >
          Overview
        </Link>
        <Link
          to="/organization/events/all"
          activeProps={{
            className:
              "font-medium text-purple-600/80 pb-3 border-b-2 border-b-purple-600/80",
          }}
          activeOptions={{ exact: false }}
          className="text-base hover:bg-neutral-200/70 transition-colors"
        >
          All Events
        </Link>
      </div>
    </>
  );
}
