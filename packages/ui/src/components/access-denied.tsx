import { authClient, type Session } from "@repo/auth/client.js";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Logo } from "@repo/ui/components/ui/logo";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Link } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";

export const AccessDenied = ({
	session,
	isPending,
	appName,
	role,
}: {
	session: Session | null;
	isPending: boolean;
	appName: string;
	role: string;
}) => {
	return (
		<div className="min-h-screen flex items-center justify-center flex-col gap-4">
			<Logo />
			<h1 className="text-3xl">{appName}</h1>
			{isPending && <Spinner className="text-primary" />}
			<div className="flex flex-row gap-2">
				{session ? (
					<>
						<Button>
							<Link to="/dashboard">Ir al Dashboard</Link>
						</Button>
						<Button
							variant="destructive"
							onClick={async () => {
								const { error } = await authClient.signOut();
								if (error) {
									console.error("Error al cerrar sesión:", error);
								}
							}}
						>
							Cerrar sesión
						</Button>
					</>
				) : (
					<Button asChild>
						<Link to="/iniciar-sesion">Iniciar sesión</Link>
					</Button>
				)}
			</div>
			{session && session?.user?.role !== role && (
				<Alert className="max-w-md" variant="destructive">
					<AlertCircleIcon />
					<AlertTitle>Acceso denegado</AlertTitle>
					<AlertDescription>
						<p>
							Tu cuenta no tiene permisos para acceder a esta aplicación. Por
							favor, contacta al administrador si crees que esto es un error.
						</p>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};
