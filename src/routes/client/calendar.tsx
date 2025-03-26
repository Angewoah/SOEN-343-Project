import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/client/calendar"!</div>
}
