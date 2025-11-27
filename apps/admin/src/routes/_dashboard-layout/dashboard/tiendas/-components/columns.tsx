import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import type { Shop } from "../../../../../api/shops";

export const columns: ColumnDef<Shop>[] = [
	{
		accessorKey: "name",
		header: "Tienda",
		cell: ({ row }) => {
			const { name, logo } = row.original;

			return (
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarImage src={logo || ""} alt={`${name}'s logo`} />
						<AvatarFallback>
							{name
								.split(" ")
								.slice(0, 2)
								.map((n) => n[0])
								.join("")
								.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="font-medium">{name}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <span>{row.original.email || "-"}</span>;
		},
	},
	{
		accessorKey: "userName",
		header: "Propietario",
		cell: ({ row }) => {
			const { userName, userEmail } = row.original;

			return (
				<div className="flex flex-col">
					<span className="font-medium">{userName || "-"}</span>
					<span className="text-xs text-muted-foreground">{userEmail}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "address",
		header: "Dirección",
		cell: ({ row }) => {
			return (
				<span className="truncate max-w-[200px] block">
					{row.original.address || "-"}
				</span>
			);
		},
	},
	{
		accessorKey: "acceptsDelivery",
		header: () => <div className="text-center">Delivery</div>,
		cell: ({ row }) => {
			const { acceptsDelivery } = row.original;

			return (
				<div className="flex items-center justify-center">
					{acceptsDelivery ? (
						<CheckCircle2Icon className="h-5 w-5 text-green-600" />
					) : (
						<XCircleIcon className="h-5 w-5 text-red-600" />
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "acceptsPickup",
		header: () => <div className="text-center">Pickup</div>,
		cell: ({ row }) => {
			const { acceptsPickup } = row.original;

			return (
				<div className="flex items-center justify-center">
					{acceptsPickup ? (
						<CheckCircle2Icon className="h-5 w-5 text-green-600" />
					) : (
						<XCircleIcon className="h-5 w-5 text-red-600" />
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de creación",
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return <span>{date.toLocaleDateString("es-AR")}</span>;
		},
	},
];
