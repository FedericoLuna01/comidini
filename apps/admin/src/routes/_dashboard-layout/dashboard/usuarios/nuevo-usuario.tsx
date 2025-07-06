import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingTitle, HeadingDescription, HeadingSeparator } from '@repo/ui/components/heading'
import { NewUserForm } from './-components/new-user-form'

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
        <HeadingSeparator />
      </Heading>
      <NewUserForm />
    </div>
  )
}
