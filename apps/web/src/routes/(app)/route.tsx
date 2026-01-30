import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "../../components/app-header";

export const Route = createFileRoute("/(app)")({
	component: AppLayout,
});

function AppLayout() {
	return (
		<>
			<AppHeader />
			<Outlet />
		</>
	);
}
