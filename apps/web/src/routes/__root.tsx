import { Toaster } from '@repo/ui/components/ui/sonner'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster position="top-center" richColors />
        <TanStackRouterDevtools />
      </>
    )
  },
})
