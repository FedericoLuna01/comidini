import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NotFound } from "../components/not-found";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Index,
  notFoundComponent: () => <NotFound />,
});

function Index() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
