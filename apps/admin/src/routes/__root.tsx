import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@repo/ui/components/sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Index,
  // TODO: Agregar un not found copado
  notFoundComponent: () => <div>Not Found</div>,
})

function Index() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
      {/* <TanStackRouterDevtools /> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}