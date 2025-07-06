import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'
import { Home, Inbox, Settings, UsersIcon, UtensilsIcon } from 'lucide-react';
import { SidebarLayout } from '@repo/ui/components/sidebar-layout'

const adminItems = [
  {
    title: "Inicio",
    to: "/dashboard",
    icon: Home,
  },
  {
    title: "Usuarios",
    to: "/dashboard/usuarios",
    icon: UsersIcon,
  },
  {
    title: "Tiendas",
    to: "/dashboard/tiendas",
    icon: UtensilsIcon,
  },
  {
    title: "Tickets",
    to: "/dashboard/tickets",
    icon: Inbox,
  },
  {
    title: "Configuración",
    to: "/dashboard/configuracion",
    icon: Settings,
  },
]

export const Route = createFileRoute('/_dashboard-layout')({
  beforeLoad: async () => {
    // Check if the user is authenticated
    const session = await authClient.getSession({})
    if (!session.data) {
      throw redirect({
        to: "/login",
      })
    }

    if (session.data.user.role !== 'admin') {
      throw redirect({
        to: "/",
      })
    }

    return { session }
  },
  component: RouteComponent,
  errorComponent: () => <div>Error loading dashboard</div>,
})

function RouteComponent() {
  // TODO: Ver q hacer con esto xq se ejecuta muy seguido
  const { session } = Route.useRouteContext()

  if (!session.data) {
    return null // O manejar el caso de usuario no autenticado
  }

  return (
    <SidebarLayout items={adminItems} user={session.data.user} />
  )
}
