import { Toaster } from "@repo/ui/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { NotFound } from "../components/not-found";

export const Route = createRootRoute({
	notFoundComponent: NotFound,
	component: () => {
		return (
			<>
				<Outlet />
				<Toaster position="bottom-right" richColors />
				<TanStackRouterDevtools />
				<ReactQueryDevtools initialIsOpen={false} />
			</>
		);
	},
});
