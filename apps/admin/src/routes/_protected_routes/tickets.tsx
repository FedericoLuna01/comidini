import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected_routes/tickets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected_routes/tickets"!</div>
}
