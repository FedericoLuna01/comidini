import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/dashboard/tickets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected_routes/tickets"!</div>
}
