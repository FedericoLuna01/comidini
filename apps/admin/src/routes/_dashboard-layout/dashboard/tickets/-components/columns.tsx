import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { TicketListItem } from "../../../../../api/tickets";

const ticketTypeLabels = {
	error: "Error",
	question: "Consulta",
	other: "Otro",
};

const ticketStatusLabels = {
	open: "Abierto",
	closed: "Cerrado",
	in_progress: "En progreso",
};

const ticketStatusColors = {
	open: "bg-yellow-500",
	closed: "bg-green-500",
	in_progress: "bg-blue-500",
};

export const columns: ColumnDef<TicketListItem>[] = [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => {
			return <span className="font-mono text-sm">#{row.original.id}</span>;
		},
	},
	{
		accessorKey: "shopName",
		header: "Tienda",
		cell: ({ row }) => {
			return (
				<span className="font-medium">
					{row.original.shopName || "Sin tienda"}
				</span>
			);
		},
	},
	{
		accessorKey: "subject",
		header: "Asunto",
		cell: ({ row }) => {
			return (
				<span className="truncate max-w-[300px] block">
					{row.original.subject}
				</span>
			);
		},
	},
	{
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.original.type;
			return <Badge variant="outline">{ticketTypeLabels[type]}</Badge>;
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<Badge className={ticketStatusColors[status]}>
					{ticketStatusLabels[status]}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha",
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return (
				<span className="text-sm text-muted-foreground">
					{date.toLocaleDateString("es-ES", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Acciones</div>,
		cell: ({ row }) => {
			const ticket = row.original;

			return (
				<div className="flex items-center justify-center">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" size="sm">
								<Eye className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Ticket #{ticket.id}</DialogTitle>
								<DialogDescription>
									{ticketTypeLabels[ticket.type]} -{" "}
									{ticketStatusLabels[ticket.status]}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold text-sm text-muted-foreground">
										Tienda
									</h4>
									<p>{ticket.shopName || "Sin tienda"}</p>
								</div>
								<div>
									<h4 className="font-semibold text-sm text-muted-foreground">
										Asunto
									</h4>
									<p>{ticket.subject}</p>
								</div>
								<div>
									<h4 className="font-semibold text-sm text-muted-foreground">
										Mensaje
									</h4>
									<p className="whitespace-pre-wrap text-sm">
										{ticket.message}
									</p>
								</div>
								<div>
									<h4 className="font-semibold text-sm text-muted-foreground">
										Fecha de creación
									</h4>
									<p className="text-sm">
										{new Date(ticket.createdAt).toLocaleString("es-ES", {
											day: "2-digit",
											month: "long",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			);
		},
	},
];
