import { Badge } from "@repo/ui/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { Order } from "../../../../../api/orders";
import { RowActionsDropdown } from "./row-actions-dropdown";

const statusLabels: Record<Order["status"], string> = {
	pending: "Pendiente",
	confirmed: "Confirmado",
	preparing: "En preparación",
	ready: "Listo",
	in_delivery: "En camino",
	delivered: "Entregado",
	cancelled: "Cancelado",
	refunded: "Reembolsado",
};

const statusVariants: Record<
	Order["status"],
	"default" | "secondary" | "destructive" | "outline"
> = {
	pending: "outline",
	confirmed: "secondary",
	preparing: "secondary",
	ready: "default",
	in_delivery: "default",
	delivered: "default",
	cancelled: "destructive",
	refunded: "destructive",
};

const typeLabels: Record<Order["type"], string> = {
	delivery: "Delivery",
	pickup: "Retiro",
	dine_in: "En local",
};

const paymentMethodLabels: Record<Order["paymentMethod"], string> = {
	cash: "Efectivo",
	card: "Tarjeta",
	transfer: "Transferencia",
};

export const columns: ColumnDef<Order>[] = [
	{
		id: "orderNumber",
		accessorKey: "orderNumber",
		header: "# Orden",
		cell: ({ row }) => (
			<span className="font-mono text-sm">{row.original.orderNumber}</span>
		),
	},
	{
		id: "customerName",
		accessorKey: "customerName",
		header: "Cliente",
	},
	{
		id: "customerPhone",
		accessorKey: "customerPhone",
		header: "Teléfono",
	},
	{
		id: "type",
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => typeLabels[row.original.type] || row.original.type,
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => (
			<Badge variant={statusVariants[row.original.status]}>
				{statusLabels[row.original.status] || row.original.status}
			</Badge>
		),
	},
	{
		id: "paymentMethod",
		accessorKey: "paymentMethod",
		header: "Pago",
		cell: ({ row }) =>
			paymentMethodLabels[row.original.paymentMethod] ||
			row.original.paymentMethod,
	},
	{
		id: "total",
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => (
			<span className="font-medium">
				${Number.parseFloat(row.original.total).toFixed(2)}
			</span>
		),
	},
	{
		id: "createdAt",
		accessorKey: "createdAt",
		header: "Fecha",
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return date.toLocaleDateString("es-AR", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			});
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return <RowActionsDropdown order={row.original} />;
		},
	},
];
