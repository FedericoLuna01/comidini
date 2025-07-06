import { DataTable } from '@repo/ui/components/data-table'
import { Heading, HeadingButton, HeadingDescription, HeadingSeparator, HeadingTitle } from '@repo/ui/components/heading'
import { createFileRoute, Link } from '@tanstack/react-router'
import { columns } from './-components/columns'
import { allUsersQueryOptions } from '../../../../api/users'
import { useQuery } from '@tanstack/react-query'
import { UserPlusIcon } from 'lucide-react'

export const Route = createFileRoute('/_dashboard-layout/dashboard/usuarios/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isPending, error, data } = useQuery(allUsersQueryOptions)

  return (
    <div>
      <Heading
      >
        <HeadingTitle>
          Usuarios
        </HeadingTitle>
        <HeadingDescription>
          Aquí puedes gestionar los usuarios de la aplicación.
        </HeadingDescription>
        <HeadingButton
          asChild
        >
          <Link
            to='/dashboard/usuarios/nuevo-usuario'
          >
            <UserPlusIcon /> Agregar Usuario
          </Link>
        </HeadingButton>
        <HeadingSeparator />
      </Heading>
      <DataTable
        columns={columns}
        data={data?.data?.users || []}
        isLoading={isPending}
      />
    </div>
  )
}
