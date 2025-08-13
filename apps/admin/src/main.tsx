import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "@repo/ui/styles/globals.css";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: <ignore>
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}
