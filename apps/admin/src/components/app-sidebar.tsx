import { Logo } from "@repo/ui/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import { Link } from "@tanstack/react-router"

import { Home, Inbox, Settings, UsersIcon, UtensilsIcon } from "lucide-react"
import { NavUser } from "./nav-user"
import { Session } from "@repo/auth/client"

const items = [
  {
    title: "Inicio",
    to: "/",
    icon: Home,
  },
  {
    title: "Usuarios",
    to: "/usuarios",
    icon: UsersIcon,
  },
  {
    title: "Restaurants",
    to: "/restaurants",
    icon: UtensilsIcon,
  },
  {
    title: "Tickets",
    to: "/tickets",
    icon: Inbox,
  },
  {
    title: "Configuración",
    to: "/configuracion",
    icon: Settings,
  },
]

export function AppSidebar({ user }: {
  user: Session["user"]
}) {
  return (
    <Sidebar
      variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                to="/"
                className="flex items-center justify-center w-full h-full text-lg font-bold text-sidebar-foreground hover:text-sidebar-foreground"
              >
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.to}
                      className="[&.active]:font-bold [&.active]:bg-primary/40 group"
                    >
                      <item.icon className="group-[.active]:stroke-[3px]" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup >
      </SidebarContent >
      <SidebarFooter>
        <NavUser
          user={user}
        />
      </SidebarFooter>
    </Sidebar >
  )
}