import {
	Heading,
	HeadingButton,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { NewProductForm } from "./-components/new-product-form";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/productos/nuevo-producto",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { shop } = Route.useRouteContext();

	return (
		<div>
			<Heading>
				<HeadingTitle>Nuevo Producto</HeadingTitle>
				<HeadingDescription>
					Aquí puedes añadir un nuevo producto a tu tienda.
				</HeadingDescription>
				<HeadingButton variant="outline" asChild>
					<Link to="/dashboard/productos">
						<ArrowLeftIcon /> Volver a Productos
					</Link>
				</HeadingButton>
				<HeadingSeparator />
			</Heading>
			<NewProductForm shop={shop} />
		</div>
	);
}
