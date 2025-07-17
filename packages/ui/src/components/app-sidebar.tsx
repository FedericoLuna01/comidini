import { Logo } from "@repo/ui/components/ui/logo"
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
} from "@repo/ui/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"
import { NavUser } from "@repo/ui/components/nav-user"
import { type Session } from "@repo/auth/client.js"
import { type LucideIcon } from "lucide-react"

export type AppSidebarItem = {
  title: string,
  to: string,
  icon: LucideIcon
}

export function AppSidebar({ user, items }: {
  user: Session["user"],
  items: AppSidebarItem[]
}) {
  const location = useLocation()
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
                  <SidebarMenuButton
                    asChild
                    className="group-[.active]:bg-primary/40 group-[.active]:font-bold hover:bg-primary/20"
                  >
                    <Link
                      to={item.to}
                      className={`${location.pathname === item.to ? "font-bold bg-primary/40 hover:font-bold hover:bg-primary/40" : ""}`}
                    >
                      <item.icon
                        className={`${location.pathname === item.to ? "stroke-[3px]" : "hover:stroke-[2px]"}`}
                      />
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
