import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/resource/$eventId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/organization/resource/$eventId"!</div>
}
