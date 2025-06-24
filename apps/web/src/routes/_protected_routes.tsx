import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'

export const Route = createFileRoute('/_protected_routes')({
  beforeLoad: async () => {
    // Check if the user is authenticated
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({
        to: "/login",
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_protected_routes"!
      <Outlet />
    </div>
  )
}
