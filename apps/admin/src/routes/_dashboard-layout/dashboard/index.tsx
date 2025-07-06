import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/dashboard/')({
  component: RouteComponent,
  errorComponent: () => <div>Error loading dashboard</div>,
})

function RouteComponent() {
  return (
    <div>
      Dashboard
    </div>
  )
}
