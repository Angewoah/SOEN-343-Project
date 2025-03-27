import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/settings/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/organization/settings/user"!</div>
}
