import { DataTable } from "@repo/ui/components/ui/data-table";
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { allShopsQueryOptions } from "../../../../api/shops";
import { columns } from "./-components/columns";

export const Route = createFileRoute("/_dashboard-layout/dashboard/tiendas/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isPending, data } = useQuery(allShopsQueryOptions);

	return (
		<div className="">
			<Heading>
				<HeadingTitle>Tiendas</HeadingTitle>
				<HeadingDescription>
					Aquí puedes gestionar las tiendas.
				</HeadingDescription>
				<Separator />
			</Heading>
			<DataTable
				columns={columns}
				data={data || []}
				isLoading={isPending}
				searchFor="name"
				searchForPlaceholder="Buscar por nombre..."
			/>
		</div>
	);
}
