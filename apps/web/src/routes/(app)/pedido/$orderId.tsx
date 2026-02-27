import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	CreditCard,
	Loader2,
	Package,
	XCircle,
} from "lucide-react";
import {
	createMpPreferenceMutationOptions,
	orderByIdQueryOptions,
} from "../../../api/orders";

interface OrderSearchParams {
	status?: string;
}

export const Route = createFileRoute("/(app)/pedido/$orderId")({
	component: OrderStatusPage,
	validateSearch: (search: Record<string, unknown>): OrderSearchParams => ({
		status: (search.status as string) || undefined,
	}),
});

const STATUS_CONFIG: Record<
	string,
	{
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		color: string;
		bgColor: string;
		description: string;
	}
> = {
	CREATED: {
		label: "Pedido creado",
		icon: Package,
		color: "text-blue-600",
		bgColor: "bg-blue-50",
		description: "Tu pedido ha sido recibido y está siendo procesado.",
	},
	PENDING_PAYMENT: {
		label: "Pago pendiente",
		icon: Clock,
		color: "text-yellow-600",
		bgColor: "bg-yellow-50",
		description:
			"Estamos esperando la confirmación de tu pago. Esto puede tomar unos minutos.",
	},
	PAID: {
		label: "Pagado",
		icon: CheckCircle2,
		color: "text-green-600",
		bgColor: "bg-green-50",
		description: "Tu pago fue confirmado. Tu pedido está siendo preparado.",
	},
	SCANNED: {
		label: "Completado",
		icon: CheckCircle2,
		color: "text-green-600",
		bgColor: "bg-green-50",
		description: "Tu pedido ha sido completado. ¡Gracias por tu compra!",
	},
	CANCELLED: {
		label: "Cancelado",
		icon: XCircle,
		color: "text-red-600",
		bgColor: "bg-red-50",
		description:
			"Tu pedido ha sido cancelado. Si crees que es un error, contacta a la tienda.",
	},
};

function OrderStatusPage() {
	const { orderId } = Route.useParams();
	const { status: urlStatus } = Route.useSearch();
	const navigate = useNavigate();

	const retryMpPaymentMutation = useMutation({
		...createMpPreferenceMutationOptions(),
		onSuccess: (data) => {
			window.location.href = data.initPoint;
		},
		onError: (error) => {
			toast.error(`Error al reintentar el pago: ${error.message}`);
		},
	});

	const { data, isPending, error } = useQuery({
		...orderByIdQueryOptions(Number(orderId)),
		refetchInterval: (query) => {
			// Auto-refresh while payment is pending
			const orderStatus = query.state.data?.order?.status;
			if (orderStatus === "PENDING_PAYMENT" || orderStatus === "CREATED") {
				return 5000;
			}
			return false;
		},
	});

	if (isPending) {
		return (
			<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
					<p className="text-muted-foreground">Cargando pedido...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="container mx-auto px-4 py-8 text-center">
				<XCircle className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
				<h2 className="text-xl font-semibold mb-2">Pedido no encontrado</h2>
				<p className="text-muted-foreground mb-6">
					No pudimos encontrar el pedido solicitado.
				</p>
				<Button variant="outline" asChild>
					<Link to="/">Volver al inicio</Link>
				</Button>
			</div>
		);
	}

	const orderData = data.order;
	const items = data.items || [];
	const statusConfig = STATUS_CONFIG[orderData.status] || STATUS_CONFIG.CREATED;
	const StatusIcon = statusConfig.icon;

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/" })}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">
						Pedido #{orderData.orderNumber}
					</h1>
					<p className="text-muted-foreground">
						{new Date(orderData.createdAt).toLocaleDateString("es-AR", {
							day: "numeric",
							month: "long",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
			</div>

			<div className="space-y-6">
				{/* Status */}
				<Card>
					<CardContent className="pt-6">
						<div
							className={`flex items-center gap-4 p-4 rounded-lg ${statusConfig.bgColor}`}
						>
							<StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
							<div>
								<p className={`font-semibold text-lg ${statusConfig.color}`}>
									{statusConfig.label}
								</p>
								<p className="text-sm text-muted-foreground">
									{statusConfig.description}
								</p>
							</div>
						</div>

						{/* Show MP redirect status feedback */}
						{urlStatus === "failure" &&
							orderData.status === "PENDING_PAYMENT" && (
								<div className="mt-4 p-4 bg-red-50 rounded-lg">
									<p className="text-sm text-red-600">
										El pago no se pudo completar. Puedes intentar nuevamente.
									</p>
								</div>
							)}

						{/* Retry MP payment button */}
						{orderData.paymentMethod === "mercadopago" &&
							(orderData.status === "PENDING_PAYMENT" ||
								orderData.status === "CREATED") && (
								<div className="mt-4">
									<Button
										className="w-full bg-[#009EE3] hover:bg-[#0089C7] text-white"
										onClick={() => retryMpPaymentMutation.mutate(orderData.id)}
										disabled={retryMpPaymentMutation.isPending}
									>
										{retryMpPaymentMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Redirigiendo a Mercado Pago...
											</>
										) : (
											<>
												<CreditCard className="h-4 w-4 mr-2" />
												Reintentar pago con Mercado Pago
											</>
										)}
									</Button>
								</div>
							)}
					</CardContent>
				</Card>

				{/* Order details */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Detalles del pedido</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Tipo</p>
								<p className="font-medium">
									{orderData.type === "delivery"
										? "Delivery"
										: orderData.type === "pickup"
											? "Retiro en local"
											: "Comer en el lugar"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Método de pago</p>
								<p className="font-medium">
									{orderData.paymentMethod === "cash"
										? "Efectivo"
										: orderData.paymentMethod === "mercadopago"
											? "Mercado Pago"
											: orderData.paymentMethod === "card"
												? "Tarjeta"
												: "Transferencia"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Cliente</p>
								<p className="font-medium">{orderData.customerName}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Teléfono</p>
								<p className="font-medium">{orderData.customerPhone}</p>
							</div>
						</div>

						{orderData.deliveryAddress && (
							<div className="text-sm">
								<p className="text-muted-foreground">Dirección de entrega</p>
								<p className="font-medium">{orderData.deliveryAddress}</p>
							</div>
						)}

						{orderData.notes && (
							<div className="text-sm">
								<p className="text-muted-foreground">Notas</p>
								<p className="font-medium">{orderData.notes}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Items */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Productos</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{items.map(
							(item: {
								orderItem: {
									id: number;
									productName: string;
									quantity: number;
									totalPrice: string;
								};
								modifiers?: Array<{
									id: number;
									optionName: string;
									groupName: string;
								}>;
								addons?: Array<{
									id: number;
									addonName: string;
								}>;
							}) => (
								<div
									key={item.orderItem.id}
									className="flex justify-between items-start"
								>
									<div>
										<p className="text-sm font-medium">
											{item.orderItem.quantity}x {item.orderItem.productName}
										</p>
										{item.modifiers && item.modifiers.length > 0 && (
											<p className="text-xs text-muted-foreground">
												{item.modifiers.map((mod) => mod.optionName).join(", ")}
											</p>
										)}
										{item.addons && item.addons.length > 0 && (
											<p className="text-xs text-muted-foreground">
												+{item.addons.map((a) => a.addonName).join(", ")}
											</p>
										)}
									</div>
									<span className="text-sm font-medium">
										${Number.parseFloat(item.orderItem.totalPrice).toFixed(2)}
									</span>
								</div>
							),
						)}

						<Separator />

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${Number.parseFloat(orderData.subtotal).toFixed(2)}</span>
							</div>
							{Number.parseFloat(orderData.deliveryFee || "0") > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Envío</span>
									<span>
										${Number.parseFloat(orderData.deliveryFee).toFixed(2)}
									</span>
								</div>
							)}
							{Number.parseFloat(orderData.discountAmount || "0") > 0 && (
								<div className="flex justify-between text-sm text-green-600">
									<span>Descuento</span>
									<span>
										-$
										{Number.parseFloat(orderData.discountAmount).toFixed(2)}
									</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span>${Number.parseFloat(orderData.total).toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Status history */}
				{data.statusHistory && data.statusHistory.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Historial del pedido</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{data.statusHistory.map(
									(entry: {
										id: number;
										status: string;
										notes: string | null;
										createdAt: string;
									}) => {
										const config =
											STATUS_CONFIG[entry.status] || STATUS_CONFIG.CREATED;
										return (
											<div key={entry.id} className="flex items-start gap-3">
												<Badge
													variant="secondary"
													className={`${config.bgColor} ${config.color} border-none`}
												>
													{config.label}
												</Badge>
												<div className="flex-1">
													{entry.notes && (
														<p className="text-sm text-muted-foreground">
															{entry.notes}
														</p>
													)}
													<p className="text-xs text-muted-foreground">
														{new Date(entry.createdAt).toLocaleDateString(
															"es-AR",
															{
																day: "numeric",
																month: "short",
																hour: "2-digit",
																minute: "2-digit",
															},
														)}
													</p>
												</div>
											</div>
										);
									},
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Actions */}
				<div className="flex gap-4">
					<Button variant="outline" className="flex-1" asChild>
						<Link to="/">Volver al inicio</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
