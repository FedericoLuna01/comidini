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
import { UserPlusIcon } from "lucide-react";
import { allUsersQueryOptions } from "../../../../api/users";
import { columns } from "./-components/columns";

export const Route = createFileRoute("/_dashboard-layout/dashboard/usuarios/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isPending, data } = useQuery(allUsersQueryOptions);

	return (
		<div>
			<Heading>
				<HeadingTitle>Usuarios</HeadingTitle>
				<HeadingDescription>
					Aquí puedes gestionar los usuarios de la aplicación.
				</HeadingDescription>
				<HeadingButton asChild>
					<Link to="/dashboard/usuarios/nuevo-usuario">
						<UserPlusIcon /> Agregar Usuario
					</Link>
				</HeadingButton>
				<HeadingSeparator />
			</Heading>
			<DataTable
				columns={columns}
				data={data?.data?.users || []}
				isLoading={isPending}
				searchFor="email"
				searchForPlaceholder="Buscar por email..."
			/>
		</div>
	);
}
