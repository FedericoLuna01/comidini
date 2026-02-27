import { LoginForm } from "@repo/ui/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

interface LoginSearchParams {
	redirect?: string;
}

export const Route = createFileRoute("/(auth)/iniciar-sesion")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): LoginSearchParams => ({
		redirect: (search.redirect as string) || undefined,
	}),
});

function RouteComponent() {
	const { redirect } = Route.useSearch();

	return (
		<div className="min-h-screen flex items-center justify-center">
			<LoginForm callbackURL={redirect || "/"} />
		</div>
	);
}
