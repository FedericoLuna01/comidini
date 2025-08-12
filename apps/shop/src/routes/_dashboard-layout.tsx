import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'
import { ClockIcon, Home, PackageOpenIcon, Settings, UtensilsIcon } from 'lucide-react'
import { SidebarLayout } from '@repo/ui/components/sidebar-layout'
import { SelectShop } from '@repo/db/src/types/shop'

const shopItems = [
  {
    title: "Inicio",
    to: "/dashboard",
    icon: Home,
  },
  {
    title: "Productos",
    to: "/dashboard/productos",
    icon: PackageOpenIcon,
  },
  {
    title: "Pedidos",
    to: "/dashboard/pedidos",
    icon: UtensilsIcon,
  },
  {
    title: "Configuración",
    to: "/dashboard/configuracion",
    icon: Settings,
  },
  {
    title: "Horarios",
    to: "/dashboard/horarios",
    icon: ClockIcon,
  },
]

export const Route = createFileRoute('/_dashboard-layout')({
  beforeLoad: async ({ context }) => {

    const queryClient = context.queryClient

    let shop: SelectShop | undefined;

    // Check if the user is authenticated
    const session = await authClient.getSession({}, {
      onSuccess: async (ctx) => {

        if (!ctx.data) {
          throw redirect({
            to: "/iniciar-sesion",
          })
        }

        if (ctx.data.user.role !== 'shop') {
          throw redirect({
            to: "/",
          })
        }

        const data = await queryClient.fetchQuery({
          queryKey: ['dashboard'],
          queryFn: async () => {
            const response = await fetch('http://localhost:3001/api/shops/status', {
              credentials: 'include',
            })
            if (!response.ok) {
              throw new Error('Failed to fetch dashboard data')
            }
            return response.json()
          },
        })
        shop = data.shop;

        if (!shop) {
          throw redirect({
            to: "/primeros-pasos",
          })
        }

      }
    })

    if (!session.data) {
      throw redirect({
        to: "/iniciar-sesion",
      })
    }

    if (session.data.user.role !== 'shop') {
      throw redirect({
        to: "/",
      })
    }

    return { session, shop }
  },
  component: RouteComponent,
  errorComponent: () => <div>Error loading dashboard</div>,
})

function RouteComponent() {
  const { session, shop } = Route.useRouteContext()

  if (!session.data) {
    return null // O manejar el caso de usuario no autenticado
  }

  return (
    <SidebarLayout items={shopItems} user={session.data.user} />
  )
}
