import type { Session } from "@repo/auth/client";
import { NavUser } from "@repo/ui/components/nav-user";
import { Logo } from "@repo/ui/components/ui/logo";
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
} from "@repo/ui/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Inbox, Settings, UsersIcon, UtensilsIcon } from "lucide-react";

const items = [
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
];

export function AppSidebar({ user }: { user: Session["user"] }) {
	const location = useLocation();
	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Logo />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="group-[.active]:bg-primary/40 group-[.active]:font-bold hover:bg-primary/20 hover:font-bold"
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
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
