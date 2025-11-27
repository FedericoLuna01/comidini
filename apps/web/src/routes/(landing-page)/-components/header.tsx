import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/ui/button";
import { Logo } from "@repo/ui/components/ui/logo";
import { Link } from "@tanstack/react-router";
import AvatarDropdown from "../../../components/avatar-dropdown";

export const Header = () => {
	const session = authClient.useSession();

	return (
		<header className=" py-4 fixed top-0 w-full bg-background z-50 border-b">
			<div className="flex items-center justify-between container mx-auto">
				<Logo />
				<nav className="hidden md:flex items-center space-x-8">
					<a
						href="#como-funciona"
						className="text-gray-700 hover:text-primary transition-colors font-medium"
					>
						Cómo funciona
					</a>
					<Link
						to="/tiendas"
						className="text-gray-700 hover:text-primary transition-colors font-medium"
					>
						Restaurantes
					</Link>
					<a
						href="#puntos"
						className="text-gray-700 hover:text-primary transition-colors font-medium"
					>
						Sistema de Puntos
					</a>
					<a
						href="#descargar"
						className="text-gray-700 hover:text-primary transition-colors font-medium"
					>
						Descargar
					</a>
				</nav>
				<div className="flex gap-4">
					{session.data ? (
						<AvatarDropdown />
					) : (
						<>
							<Button asChild variant="secondary">
								<Link to="/iniciar-sesion">Iniciar sesión</Link>
							</Button>
							<Button asChild variant="default">
								<Link to="/registrarse">Registrarse</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
};
