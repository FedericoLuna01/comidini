import { Button } from "@repo/ui/components/ui/button"
import { Logo } from "@repo/ui/components/ui/logo"
import { Link } from "@tanstack/react-router"

export const Header = () => {
  return (
    <header className="flex items-center justify-between container mx-auto py-4">
      <Logo />
      <nav className="flex gap-4">
        <Button
          asChild
          variant="secondary"
        >
          <Link
            to='/iniciar-sesion'
          >
            Iniciar sesión
          </Link>
        </Button>
        <Button
          asChild
          variant="default"
        >
          <Link
            to='/registrarse'
          >
            Registrarse
          </Link>
        </Button>
      </nav>
    </header>
  )
}
