import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Check,
	ChefHat,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
	X,
} from "lucide-react";
import {
	type Order,
	orderByIdQueryOptions,
	updateOrderStatusMutationOptions,
} from "../../../../api/orders";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/pedidos/$orderId",
)({
	component: RouteComponent,
});

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
	pickup: "Retiro en local",
	dine_in: "Comer en local",
};

const paymentMethodLabels: Record<Order["paymentMethod"], string> = {
	cash: "Efectivo",
	card: "Tarjeta",
	transfer: "Transferencia",
};

function RouteComponent() {
	const params = Route.useParams();
	const queryClient = useQueryClient();

	const { data, isPending, error } = useQuery(
		orderByIdQueryOptions(Number(params.orderId)),
	);

	const updateStatusMutation = useMutation({
		...updateOrderStatusMutationOptions(Number(params.orderId)),
		onSuccess: () => {
			toast.success("Estado actualizado");
			queryClient.invalidateQueries({
				queryKey: ["get-order", Number(params.orderId)],
			});
			queryClient.invalidateQueries({ queryKey: ["get-orders"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (isPending) {
		return <div>Cargando...</div>;
	}

	if (error || !data) {
		return <div>Error al cargar la orden</div>;
	}

	const { order, items, statusHistory } = data;

	const getNextActions = () => {
		switch (order.status) {
			case "pending":
				return [
					{
						status: "confirmed" as const,
						label: "Confirmar",
						icon: <Check className="mr-2 h-4 w-4" />,
						variant: "default" as const,
					},
					{
						status: "cancelled" as const,
						label: "Cancelar",
						icon: <X className="mr-2 h-4 w-4" />,
						variant: "destructive" as const,
					},
				];
			case "confirmed":
				return [
					{
						status: "preparing" as const,
						label: "En preparación",
						icon: <ChefHat className="mr-2 h-4 w-4" />,
						variant: "default" as const,
					},
				];
			case "preparing":
				return [
					{
						status: "ready" as const,
						label: "Listo",
						icon: <Package className="mr-2 h-4 w-4" />,
						variant: "default" as const,
					},
				];
			case "ready":
				if (order.type === "delivery") {
					return [
						{
							status: "in_delivery" as const,
							label: "En camino",
							icon: <Truck className="mr-2 h-4 w-4" />,
							variant: "default" as const,
						},
					];
				}
				return [
					{
						status: "delivered" as const,
						label: "Entregado",
						icon: <Check className="mr-2 h-4 w-4" />,
						variant: "default" as const,
					},
				];
			case "in_delivery":
				return [
					{
						status: "delivered" as const,
						label: "Entregado",
						icon: <Check className="mr-2 h-4 w-4" />,
						variant: "default" as const,
					},
				];
			default:
				return [];
		}
	};

	const nextActions = getNextActions();

	return (
		<div>
			<Heading>
				<div className="flex items-center gap-4">
					<Link to="/dashboard/pedidos">
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<HeadingTitle>Pedido {order.orderNumber}</HeadingTitle>
						<HeadingDescription>
							{new Date(order.createdAt).toLocaleDateString("es-AR", {
								day: "2-digit",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</HeadingDescription>
					</div>
					<Badge
						variant={statusVariants[order.status]}
						className="ml-auto text-sm"
					>
						{statusLabels[order.status]}
					</Badge>
				</div>
				<HeadingSeparator />
			</Heading>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Información del pedido */}
				<div className="lg:col-span-2 space-y-6">
					{/* Items */}
					<Card>
						<CardHeader>
							<CardTitle>Productos</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{items.map((item) => (
								<div
									key={item.orderItem.id}
									className="flex gap-4 p-3 border rounded-lg"
								>
									{item.product?.images?.[0] && (
										<img
											src={item.product.images[0]}
											alt={item.orderItem.productName}
											className="h-16 w-16 rounded object-cover"
										/>
									)}
									<div className="flex-1">
										<h4 className="font-medium">
											{item.orderItem.productName}
										</h4>
										{item.addons.length > 0 && (
											<p className="text-sm text-muted-foreground">
												{item.addons
													.map(
														(addon) => `${addon.addonName} x${addon.quantity}`,
													)
													.join(", ")}
											</p>
										)}
										{item.orderItem.notes && (
											<p className="text-sm text-muted-foreground italic">
												Nota: {item.orderItem.notes}
											</p>
										)}
									</div>
									<div className="text-right">
										<p className="font-medium">
											${Number.parseFloat(item.orderItem.totalPrice).toFixed(2)}
										</p>
										<p className="text-sm text-muted-foreground">
											x{item.orderItem.quantity}
										</p>
									</div>
								</div>
							))}

							<Separator />

							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>${Number.parseFloat(order.subtotal).toFixed(2)}</span>
								</div>
								{Number.parseFloat(order.deliveryFee) > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Envío</span>
										<span>
											${Number.parseFloat(order.deliveryFee).toFixed(2)}
										</span>
									</div>
								)}
								{Number.parseFloat(order.discountAmount) > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Descuento</span>
										<span>
											-$
											{Number.parseFloat(order.discountAmount).toFixed(2)}
										</span>
									</div>
								)}
							</div>

							<Separator />

							<div className="flex justify-between text-lg font-semibold">
								<span>Total</span>
								<span>${Number.parseFloat(order.total).toFixed(2)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Historial de estados */}
					<Card>
						<CardHeader>
							<CardTitle>Historial</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{statusHistory.map((history, index) => (
									<div key={history.id} className="flex gap-4">
										<div className="flex flex-col items-center">
											<div className="h-3 w-3 rounded-full bg-primary" />
											{index < statusHistory.length - 1 && (
												<div className="w-0.5 flex-1 bg-border" />
											)}
										</div>
										<div className="pb-4">
											<p className="font-medium">
												{statusLabels[history.status as Order["status"]] ||
													history.status}
											</p>
											<p className="text-sm text-muted-foreground">
												{new Date(history.createdAt).toLocaleDateString(
													"es-AR",
													{
														day: "2-digit",
														month: "short",
														hour: "2-digit",
														minute: "2-digit",
													},
												)}
											</p>
											{history.notes && (
												<p className="text-sm text-muted-foreground mt-1">
													{history.notes}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Acciones */}
					{nextActions.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Acciones</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{nextActions.map((action) => (
									<Button
										key={action.status}
										variant={action.variant}
										className="w-full justify-start"
										onClick={() =>
											updateStatusMutation.mutate({ status: action.status })
										}
										disabled={updateStatusMutation.isPending}
									>
										{action.icon}
										{action.label}
									</Button>
								))}
							</CardContent>
						</Card>
					)}

					{/* Cliente */}
					<Card>
						<CardHeader>
							<CardTitle>Cliente</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<span>{order.customerName}</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<span>{order.customerPhone}</span>
							</div>
							{order.customerEmail && (
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{order.customerEmail}
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Entrega */}
					<Card>
						<CardHeader>
							<CardTitle>Entrega</CardTitle>
							<CardDescription>{typeLabels[order.type]}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{order.deliveryAddress && (
								<div className="flex items-start gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
									<span className="text-sm">{order.deliveryAddress}</span>
								</div>
							)}
							{order.deliveryInstructions && (
								<p className="text-sm text-muted-foreground">
									{order.deliveryInstructions}
								</p>
							)}
						</CardContent>
					</Card>

					{/* Pago */}
					<Card>
						<CardHeader>
							<CardTitle>Pago</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Método</span>
								<span>{paymentMethodLabels[order.paymentMethod]}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Estado</span>
								<Badge variant="outline">{order.paymentStatus}</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Notas */}
					{order.notes && (
						<Card>
							<CardHeader>
								<CardTitle>Notas del cliente</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{order.notes}</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
