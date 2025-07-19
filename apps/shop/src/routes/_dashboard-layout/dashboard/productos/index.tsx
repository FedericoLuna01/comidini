import { Heading, HeadingDescription, HeadingSeparator, HeadingTitle, HeadingButton } from '@repo/ui/components/ui/heading'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PackagePlusIcon } from 'lucide-react'

export const Route = createFileRoute('/_dashboard-layout/dashboard/productos/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return (
    <div>
      <Heading>
        <HeadingTitle>
          Productos
        </HeadingTitle>
        <HeadingDescription>
          Aquí puedes gestionar los productos de tu tienda.
        </HeadingDescription>
        <HeadingButton
          asChild
        >
          <Link
            to='/dashboard/productos/nuevo-producto'
          >
            <PackagePlusIcon /> Añadir Producto
          </Link>
        </HeadingButton>
        <HeadingSeparator />
      </Heading>
      {/* TODO: Agregar tabla de productos */}
    </div>
  )
}
