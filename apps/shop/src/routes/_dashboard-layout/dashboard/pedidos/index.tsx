import { DataTable } from "@repo/ui/components/ui/data-table";
import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ordersByShopIdQueryOptions } from "../../../../api/orders";
import { columns } from "./-components/columns";

export const Route = createFileRoute("/_dashboard-layout/dashboard/pedidos/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shop } = Route.useRouteContext();

	const { isPending, data } = useQuery(ordersByShopIdQueryOptions(shop?.id));

	return (
		<div>
			<Heading>
				<HeadingTitle>Pedidos</HeadingTitle>
				<HeadingDescription>
					Aquí puedes ver y gestionar los pedidos de tu tienda.
				</HeadingDescription>
				<HeadingSeparator />
			</Heading>
			<DataTable
				columns={columns}
				data={data || []}
				isLoading={isPending}
				searchFor="orderNumber"
				searchForPlaceholder="Buscar por número de orden..."
			/>
		</div>
	);
}
