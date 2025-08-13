import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { getUserByIdQueryOptions } from "../../../../../api/users";
import { EditUserForm } from "../-components/edit-user-form";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/usuarios/editar-usuario/$userId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { userId } = useParams({
		from: "/_dashboard-layout/dashboard/usuarios/editar-usuario/$userId",
	});

	const { data, isLoading, error } = useQuery(getUserByIdQueryOptions(userId));
	const user = data?.data.users[0];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Cargando usuario...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600">Error</h2>
					<p className="text-gray-600 mt-2">No se pudo cargar el usuario</p>
				</div>
			</div>
		);
	}

	if (!user && !isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-600">
						Usuario no encontrado
					</h2>
					<p className="text-gray-500 mt-2">El usuario que buscas no existe</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Heading>
				<HeadingTitle>Editar Usuario</HeadingTitle>
				<HeadingDescription>
					Modificar la información del usuario {user?.name}
				</HeadingDescription>
				<HeadingSeparator />
			</Heading>
			<EditUserForm user={user} />
		</div>
	);
}
