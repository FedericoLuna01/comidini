import { authClient } from "@repo/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Logo } from "@repo/ui/components/ui/logo";
import { Link } from "@tanstack/react-router";
import AvatarDropdown from "../../../components/avatar-dropdown";

export const Header = () => {
  const session = authClient.useSession();

  return (
    <header className="flex items-center justify-between container mx-auto py-4">
      <Logo />
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#como-funciona" className="text-gray-700 hover:text-primary transition-colors font-medium">
          Cómo funciona
        </a>
        <a href="#restaurantes" className="text-gray-700 hover:text-primary transition-colors font-medium">
          Restaurantes
        </a>
        <a href="#puntos" className="text-gray-700 hover:text-primary transition-colors font-medium">
          Sistema de Puntos
        </a>
        <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium hover:text-primary">
          Para Restaurantes
        </Link>
        <a href="#descargar" className="text-gray-700 hover:text-primary transition-colors font-medium">
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
    </header>
  );
};
