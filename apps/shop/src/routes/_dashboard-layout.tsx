import { authClient } from "@repo/auth/client";
import type { SelectShop } from "@repo/db/src/types/shop";
import type { CreateTicket } from "@repo/db/src/types/ticket";
import { SidebarLayout } from "@repo/ui/components/sidebar-layout";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/components/ui/sonner";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ClockIcon,
	GripVerticalIcon,
	Home,
	PackageOpenIcon,
	Settings,
	UtensilsIcon,
} from "lucide-react";
import { useState } from "react";
import { createTicket } from "../api/tickets";

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
		title: "Organizar Menú",
		to: "/dashboard/organizar-menu",
		icon: GripVerticalIcon,
	},
	{
		title: "Pedidos",
		to: "/dashboard/pedidos",
		icon: UtensilsIcon,
	},
	{
		title: "Horarios",
		to: "/dashboard/horarios",
		icon: ClockIcon,
	},
	{
		title: "Configuración",
		to: "/dashboard/configuracion",
		icon: Settings,
	},
];

export const Route = createFileRoute("/_dashboard-layout")({
	beforeLoad: async ({ context }) => {
		const queryClient = context.queryClient;

		let shop: SelectShop | undefined;

		// Check if the user is authenticated
		const session = await authClient.getSession(
			{},
			{
				onSuccess: async (ctx) => {
					if (!ctx.data) {
						throw redirect({
							to: "/iniciar-sesion",
						});
					}

					if (ctx.data.user.role !== "shop") {
						throw redirect({
							to: "/",
						});
					}

					const data = await queryClient.fetchQuery({
						queryKey: ["dashboard"],
						queryFn: async () => {
							const response = await fetch(
								`${import.meta.env.VITE_API_URL}/shops/status`,
								{
									credentials: "include",
								},
							);
							if (!response.ok) {
								throw new Error("Failed to fetch dashboard data");
							}
							return response.json();
						},
					});
					shop = data.shop;

					if (!shop) {
						throw redirect({
							to: "/primeros-pasos",
						});
					}
				},
			},
		);

		if (!session.data) {
			throw redirect({
				to: "/iniciar-sesion",
			});
		}

		if (session.data.user.role !== "shop") {
			throw redirect({
				to: "/",
			});
		}

		return { session, shop };
	},
	component: RouteComponent,
	errorComponent: () => <div>Error loading dashboard</div>,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const [open, setOpen] = useState(false);
	const [ticketData, setTicketData] = useState<CreateTicket>({
		type: "question",
		subject: "",
		message: "",
	});

	const mutation = useMutation({
		mutationFn: createTicket,
		onSuccess: () => {
			toast.success("Ticket enviado correctamente");
			setOpen(false);
			setTicketData({
				type: "question",
				subject: "",
				message: "",
			});
		},
		onError: () => {
			toast.error("Error al enviar el ticket");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutation.mutate(ticketData);
	};

	if (!session.data) {
		return null; // O manejar el caso de usuario no autenticado
	}

	return (
		<>
			<SidebarLayout
				items={shopItems}
				user={session.data.user}
				extraContent={
					<Card className="gap-2 shadow-none">
						<CardHeader className="px-4">
							<CardTitle className="text-sm">
								¿Encontraste un error o tienes una sugerencia?
							</CardTitle>
							<CardDescription>
								Cuéntanos si algo no funcionó o si tienes una idea para mejorar
								la app.
							</CardDescription>
						</CardHeader>
						<CardContent className="px-4">
							<Button
								className="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none"
								size="sm"
								onClick={() => setOpen(true)}
							>
								Reportar o sugerir
							</Button>
						</CardContent>
					</Card>
				}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Enviar ticket de soporte</DialogTitle>
						<DialogDescription>
							Reporta un error o envía una consulta. Nuestro equipo te
							responderá lo antes posible.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="type">Tipo de ticket</Label>
							<Select
								value={ticketData.type}
								onValueChange={(value) =>
									setTicketData({
										...ticketData,
										type: value as CreateTicket["type"],
									})
								}
							>
								<SelectTrigger id="type">
									<SelectValue placeholder="Selecciona un tipo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="error">Error</SelectItem>
									<SelectItem value="question">Consulta</SelectItem>
									<SelectItem value="other">Otro</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="subject">Asunto</Label>
							<Input
								id="subject"
								placeholder="Describe brevemente el problema"
								value={ticketData.subject}
								onChange={(e) =>
									setTicketData({ ...ticketData, subject: e.target.value })
								}
								required
								maxLength={200}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="message">Mensaje</Label>
							<Textarea
								id="message"
								placeholder="Describe el problema o consulta en detalle"
								value={ticketData.message}
								onChange={(e) =>
									setTicketData({ ...ticketData, message: e.target.value })
								}
								required
								maxLength={2000}
								rows={5}
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Enviando..." : "Enviar ticket"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
