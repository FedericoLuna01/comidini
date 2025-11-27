import { DataTable } from "@repo/ui/components/ui/data-table";
import {
	Heading,
	HeadingButton,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlusIcon } from "lucide-react";
import { allProductsQueryOptions } from "../../../../api/products";
import { columns } from "./-components/columns";

export const Route = createFileRoute("/_dashboard-layout/dashboard/productos/")(
	{
		component: RouteComponent,
	},
);

function RouteComponent() {
	const { shop } = Route.useRouteContext();

	const { isPending, data } = useQuery(allProductsQueryOptions(shop?.id));

	console.log(data);

	return (
		<div>
			<Heading>
				<HeadingTitle>Productos</HeadingTitle>
				<HeadingDescription>
					Aquí puedes gestionar los productos de tu tienda.
				</HeadingDescription>
				<HeadingButton asChild>
					<Link to="/dashboard/productos/nuevo-producto">
						<PackagePlusIcon /> Añadir Producto
					</Link>
				</HeadingButton>
				<HeadingSeparator />
			</Heading>
			<DataTable
				columns={columns}
				data={data || []}
				isLoading={isPending}
				searchFor="product.name"
				searchForPlaceholder="Buscar por nombre de producto..."
			/>
		</div>
	);
}
