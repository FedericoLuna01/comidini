import { Button } from '@repo/ui/components/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected_routes/usuarios/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    Aca irá la lista de usuarios
    <br />
    <Button asChild>
      <Link
        to={"/usuarios/nuevo-usuario"}
      >
        Nuevo usuario
      </Link>
    </Button>
  </div>
}
