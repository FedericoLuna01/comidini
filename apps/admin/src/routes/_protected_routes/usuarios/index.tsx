import { authClient } from '@repo/auth/client'
import { Button } from '@repo/ui/components/button'
import { DataTable } from '@repo/ui/components/data-table'
import { Heading, HeadingDescription, HeadingTitle } from '@repo/ui/components/heading'
import { Separator } from '@repo/ui/components/separator'
import { createFileRoute, Link } from '@tanstack/react-router'
import { columns } from './-components/columns'

export const Route = createFileRoute('/_protected_routes/usuarios/')({
  beforeLoad: async ({ context }) => {
    // TODO: Mover esto a otro lado y user react-query
    const dataUsers = await authClient.admin.listUsers({
      query: {
        limit: 10,
      },
    });

    return { dataUsers }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { dataUsers } = Route.useRouteContext()
  console.log(dataUsers)
  return (
    <div>
      <Heading>
        <HeadingTitle>
          Usuarios
        </HeadingTitle>
        <HeadingDescription>
          Aquí puedes gestionar los usuarios de la aplicación.
        </HeadingDescription>
        <Separator />
      </Heading>
      <DataTable columns={columns} data={dataUsers.data?.users ?? []} />
    </div>
  )
}
