import React from "react";
import { AppSidebar, AppSidebarItem } from "./app-sidebar.js";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb.js";
import { Separator } from "./ui/separator.js";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar.js";
import { Link, Outlet, useMatches } from "@tanstack/react-router";
import { type Session } from "@repo/auth/client.js"

interface BreadcrumbRoute {
  id: string;
  path: string;
  label: string;
}

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

export function SidebarLayout({ items, user }: {
  items: AppSidebarItem[],
  user: Session["user"]
}) {
  const matches = useMatches()
  const breadcrumbItems = React.useMemo(() => getBreadcrumbItems(matches), [matches])

  return (
    <SidebarProvider>
      <AppSidebar items={items} user={user} />
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
                {breadcrumbItems.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Inicio</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  breadcrumbItems.map((item, index) => (
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
