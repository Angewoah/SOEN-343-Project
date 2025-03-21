import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex gap-x-8">
      <Link to="/organization/dashboard">Go to organization</Link>
      <Link to="/login">Go to login</Link>
    </div>
  );
}
