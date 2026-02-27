import { Button } from "@repo/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	Check,
	ChefHat,
	Eye,
	MoreHorizontal,
	Package,
	QrCode,
	X,
} from "lucide-react";
import type React from "react";
import type { Order } from "../../../../../api/orders";
import { updateOrderStatusMutationOptions } from "../../../../../api/orders";

interface RowActionsDropdownProps {
	order: Order;
}

const nextStatusActions: Record<
	Order["status"],
	Array<{ status: Order["status"]; label: string; icon: React.ReactNode }>
> = {
	CREATED: [
		{
			status: "PENDING_PAYMENT",
			label: "Pendiente de pago",
			icon: <Package className="mr-2 h-4 w-4" />,
		},
		{
			status: "CANCELLED",
			label: "Cancelar",
			icon: <X className="mr-2 h-4 w-4" />,
		},
	],
	PENDING_PAYMENT: [
		{
			status: "PAID",
			label: "Marcar como pagado",
			icon: <Check className="mr-2 h-4 w-4" />,
		},
		{
			status: "CANCELLED",
			label: "Cancelar",
			icon: <X className="mr-2 h-4 w-4" />,
		},
	],
	PAID: [
		{
			status: "SCANNED",
			label: "QR escaneado",
			icon: <QrCode className="mr-2 h-4 w-4" />,
		},
	],
	SCANNED: [],
	CANCELLED: [],
};

export const RowActionsDropdown: React.FC<RowActionsDropdownProps> = ({
	order,
}) => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const updateStatusMutation = useMutation({
		...updateOrderStatusMutationOptions(order.id),
		onSuccess: () => {
			toast.success("Estado actualizado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["get-orders"] });
		},
		onError: (error) => {
			toast.error(error.message || "Error al actualizar el estado");
		},
	});

	const handleStatusChange = (status: Order["status"]) => {
		updateStatusMutation.mutate({ status });
	};

	const handleViewOrder = () => {
		navigate({
			to: `/dashboard/pedidos/${order.id}`,
		});
	};

	const availableActions = nextStatusActions[order.status] || [];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Abrir menú</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Acciones</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={handleViewOrder}>
					<Eye className="mr-2 h-4 w-4" />
					Ver detalles
				</DropdownMenuItem>

				{availableActions.length > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>Cambiar estado</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								{availableActions.map((action) => (
									<DropdownMenuItem
										key={action.status}
										onClick={() => handleStatusChange(action.status)}
										disabled={updateStatusMutation.isPending}
									>
										{action.icon}
										{action.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
