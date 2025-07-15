import { Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/components/ui/button";
import { Home, ArrowLeft, Store } from "lucide-react";
import { Logo } from "@repo/ui/components/ui/logo";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <div>
          <Logo />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Página no encontrada</h2>
          <p className="text-gray-500 max-w-md mx-auto">Esa comida no existe o ha sido retirada del menú.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>

          <Button asChild className="flex items-center gap-2 gradient-comidini">
            <Link to="/">
              <Store className="h-4 w-4 " />
              Ir a la tienda
            </Link>
          </Button>
        </div>

        <div className="text-sm text-gray-400">Si crees que esto es un error, por favor contacta al administrador.</div>
      </div>
    </div>
  );
}
