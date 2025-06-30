import React from 'react'
import { Link, Outlet, useMatches, createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@repo/auth/client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui/components/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import { Separator } from '@repo/ui/components/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@repo/ui/components/breadcrumb';

interface BreadcrumbRoute {
  id: string;
  path: string;
  label: string;
}

// Define la interfaz para el usuario con las propiedades que realmente tiene
interface UserFromAuth {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  role?: string;
  banReason?: string;
  banExpires?: Date;
}

export const Route = createFileRoute('/_protected_routes')({
  beforeLoad: async () => {
    // Check if the user is authenticated
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({
        to: "/login",
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function getBreadcrumbItems(matches: ReturnType<typeof useMatches>): BreadcrumbRoute[] {
  const breadcrumbs: BreadcrumbRoute[] = []
  let currentPath = ''

  matches
    .filter((match) => match.pathname !== '/') // Excluimos la ruta raíz
    .forEach((match) => {
      const pathSegments = match.pathname.split('/')

      pathSegments.forEach((segment, index) => {
        if (!segment) return

        currentPath += `/${segment}`
        const label = segment
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace(/\$|\./g, '')

        // Solo agregar si no existe ya un breadcrumb con el mismo path
        if (!breadcrumbs.some(b => b.path === currentPath)) {
          breadcrumbs.push({
            id: `${match.id}-${index}`,
            path: currentPath,
            label
          })
        }
      })
    })

  return breadcrumbs
}

function RouteComponent() {
  const matches = useMatches()
  const items = React.useMemo(() => getBreadcrumbItems(matches), [matches])

  const { session } = Route.useRouteContext()

  if (!session.data) {
    return null // O manejar el caso de usuario no autenticado
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.data.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {items.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Inicio</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <BreadcrumbItem>
                        {index === items.length - 1 ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.path}>{item.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < items.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
