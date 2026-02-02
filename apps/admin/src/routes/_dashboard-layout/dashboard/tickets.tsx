import { DataTable } from "@repo/ui/components/ui/data-table";
import { DataTablePagination } from "@repo/ui/components/ui/data-table-pagination";
import {
	Heading,
	HeadingDescription,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ticketsQueryOptions } from "../../../api/tickets";
import { columns } from "./tickets/-components/columns";

export const Route = createFileRoute("/_dashboard-layout/dashboard/tickets")({
	component: RouteComponent,
});

function RouteComponent() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const { isPending, data } = useQuery(ticketsQueryOptions({ page, limit }));

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setPage(1); // Reset to first page when changing limit
	};

	return (
		<div className="">
			<Heading>
				<HeadingTitle>Tickets de Soporte</HeadingTitle>
				<HeadingDescription>
					Aquí puedes gestionar los tickets de soporte enviados por las tiendas.
				</HeadingDescription>
				<Separator />
			</Heading>
			<DataTable
				columns={columns}
				data={data?.data || []}
				isLoading={isPending}
				searchFor="subject"
				searchForPlaceholder="Buscar por asunto..."
				showPagination={false}
			/>
			{data?.pagination && (
				<DataTablePagination
					pagination={data.pagination}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
				/>
			)}
		</div>
	);
}
