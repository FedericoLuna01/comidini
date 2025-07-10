import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'
import { AccessDenied } from '@repo/ui/components/access-denied'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()

  return (
    <AccessDenied
      session={data}
      isPending={isPending}
      appName="Tienda Admin"
      role="shop"
    />
  )
}
