import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingTitle, HeadingDescription, HeadingSeparator, HeadingButton } from '@repo/ui/components/ui/heading'
import { NewUserForm } from './-components/new-user-form'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

export const Route = createFileRoute(
  '/_dashboard-layout/dashboard/usuarios/nuevo-usuario',
)({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
      <Heading>
        <HeadingTitle>Nuevo Usuario</HeadingTitle>
        <HeadingDescription>Crear un nuevo usuario en el sistema</HeadingDescription>
        <HeadingButton
          asChild
          variant="outline"
        >
          <Link
            to="/dashboard/usuarios"
          >
            <ArrowLeftIcon /> Volver a Usuarios
          </Link>
        </HeadingButton>
        <HeadingSeparator />
      </Heading>
      <NewUserForm />
    </div>
  )
}
