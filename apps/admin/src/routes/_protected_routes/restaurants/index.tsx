import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected_routes/restaurants/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected_routes/restaurants/"!</div>
}
