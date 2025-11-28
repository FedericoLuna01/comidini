import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { createFileRoute } from "@tanstack/react-router";
import { EditShopForm } from "./-components/edit-shop-form";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/configuracion/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { shop } = Route.useRouteContext();

	if (!shop) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">
					No se encontró la tienda. Por favor, recarga la página.
				</p>
			</div>
		);
	}

	return (
		<div>
			<Heading>
				<HeadingTitle>Configuración de la tienda</HeadingTitle>
				<HeadingDescription>
					Administra la información y configuración de tu tienda.
				</HeadingDescription>
				<HeadingSeparator />
			</Heading>
			<EditShopForm shop={shop} />
		</div>
	);
}
