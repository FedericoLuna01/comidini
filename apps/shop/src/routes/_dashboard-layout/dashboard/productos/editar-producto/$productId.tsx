import {
	Heading,
	HeadingButton,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { productByIdQueryOptions } from "../../../../../api/products";
import { EditProductForm } from "../-components/edit-product-form";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/productos/editar-producto/$productId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { productId } = Route.useParams();
	const { shop } = Route.useRouteContext();

	const {
		data: productData,
		isLoading,
		error,
	} = useQuery(productByIdQueryOptions(Number(productId)));

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (error || !productData?.product) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-muted-foreground">
					No se pudo cargar el producto o no existe.
				</p>
				<Link
					to="/dashboard/productos"
					className="text-primary hover:underline"
				>
					Volver a productos
				</Link>
			</div>
		);
	}

	return (
		<div>
			<Heading>
				<HeadingTitle>Editar Producto</HeadingTitle>
				<HeadingDescription>
					Modifica los datos del producto "{productData.product.name}".
				</HeadingDescription>
				<HeadingButton variant="outline" asChild>
					<Link to="/dashboard/productos">
						<ArrowLeftIcon /> Volver a Productos
					</Link>
				</HeadingButton>
				<HeadingSeparator />
			</Heading>
			<EditProductForm shop={shop} product={productData.product} />
		</div>
	);
}
