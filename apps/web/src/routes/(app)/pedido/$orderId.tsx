import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { toast } from "@repo/ui/components/ui/sonner";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
} from "@repo/ui/components/ui/stepper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	CreditCard,
	HomeIcon,
	Loader2,
	Package,
	Receipt,
	UtensilsCrossed,
	XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
	createMpPreferenceMutationOptions,
	orderByIdQueryOptions,
} from "../../../api/orders";

interface OrderSearchParams {
	status?: string;
}

interface OrderModifier {
	id: number;
	optionName: string;
	groupName: string;
}

interface OrderAddon {
	id: number;
	addonName: string;
}

interface OrderItem {
	orderItem: {
		id: number;
		productName: string;
		quantity: number;
		totalPrice: string;
	};
	modifiers?: OrderModifier[];
	addons?: OrderAddon[];
}

interface StatusHistoryEntry {
	id: number;
	status: string;
	notes: string | null;
	createdAt: string;
}

export const Route = createFileRoute("/(app)/pedido/$orderId")({
	beforeLoad: async ({ params }) => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/iniciar-sesion",
				replace: true,
			});
		}

		// Verify order belongs to user
		const apiUrl = import.meta.env.VITE_API_URL;
		const response = await fetch(`${apiUrl}/orders/${params.orderId}`, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const orderData = await response.json();

		// Check if order belongs to current user
		if (
			orderData.order.customerId &&
			orderData.order.customerId !== session.data.user.id
		) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
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
		accent: string;
		description: string;
	}
> = {
	CREATED: {
		label: "Pedido Creado",
		icon: Package,
		color: "text-amber-600",
		accent: "bg-amber-50 border-amber-200",
		description: "Hemos recibido tu pedido con éxito.",
	},
	PENDING_PAYMENT: {
		label: "Pago Pendiente",
		icon: Clock,
		color: "text-orange-600",
		accent: "bg-orange-50 border-orange-200",
		description: "Esperando confirmación de pago para comenzar a preparar.",
	},
	PAID: {
		label: "Pagado",
		icon: CheckCircle2,
		color: "text-emerald-600",
		accent: "bg-emerald-50 border-emerald-200",
		description: "¡Pago confirmado! Estamos manos a la obra.",
	},
	PREPARING: {
		label: "Preparando",
		icon: UtensilsCrossed,
		color: "text-blue-600",
		accent: "bg-blue-50 border-blue-200",
		description: "Tu pedido está siendo preparado con amor.",
	},
	READY: {
		label: "Listo para retirar",
		icon: Package,
		color: "text-indigo-600",
		accent: "bg-indigo-50 border-indigo-200",
		description: "¡Tu pedido está listo! Ya puedes pasar a buscarlo.",
	},
	DELIVERING: {
		label: "En camino",
		icon: Package,
		color: "text-purple-600",
		accent: "bg-purple-50 border-purple-200",
		description: "Tu pedido está en camino a tu dirección.",
	},
	SCANNED: {
		label: "Entregado",
		icon: CheckCircle2,
		color: "text-emerald-700",
		accent: "bg-emerald-100 border-emerald-300",
		description: "¡Gracias por elegirnos! Que disfrutes tu comida.",
	},
	CANCELLED: {
		label: "Cancelado",
		icon: XCircle,
		color: "text-rose-600",
		accent: "bg-rose-50 border-rose-200",
		description: "El pedido ha sido cancelado.",
	},
};

function OrderStatusPage() {
	const { orderId } = Route.useParams();
	const { status: urlStatus } = Route.useSearch();

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
			const orderStatus = query.state.data?.order?.status;
			if (
				orderStatus === "PENDING_PAYMENT" ||
				orderStatus === "CREATED" ||
				orderStatus === "PAID" ||
				orderStatus === "PREPARING"
			) {
				return 10000;
			}
			return false;
		},
	});

	if (isPending) {
		return (
			<div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center space-y-6"
				>
					<div className="relative">
						<Loader2 className="h-16 w-16 animate-spin text-primary/40 mx-auto" />
						<div className="absolute inset-0 flex items-center justify-center">
							<Receipt className="h-6 w-6 text-primary" />
						</div>
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-medium tracking-tight">
							Cargando tu pedido
						</h2>
						<p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
							Estamos preparando los detalles para ti...
						</p>
					</div>
				</motion.div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="container mx-auto px-4 py-8 text-center max-w-md">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-card border rounded-3xl p-12 shadow-sm"
				>
					<XCircle className="h-20 w-20 text-destructive/20 mx-auto mb-6" />
					<h2 className="text-2xl font-semibold mb-3 tracking-tight">
						Pedido no encontrado
					</h2>
					<p className="text-muted-foreground mb-8 text-sm">
						Lo sentimos, no pudimos localizar el pedido que buscas. Verifica el
						número e intenta de nuevo.
					</p>
					<Button
						variant="default"
						className="w-full rounded-full h-12"
						asChild
					>
						<Link to="/">Volver al inicio</Link>
					</Button>
				</motion.div>
			</div>
		);
	}

	const orderData = data.order;
	const items = data.items || [];
	const statusConfig = STATUS_CONFIG[orderData.status] || STATUS_CONFIG.CREATED;
	const StatusIcon = statusConfig.icon;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-[#faf9f6]">
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Navigation */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-8"
				>
					<Button
						variant="ghost"
						className="gap-2 text-muted-foreground hover:text-foreground pl-0 group"
						// onClick={() => navigate({ to: "/" })}
						asChild
					>
						<Link to="/perfil">
							<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
							<span>Volver a mis pedidos</span>
						</Link>
					</Button>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{/* Status Hero Section */}
					<motion.div variants={itemVariants} className="text-center space-y-4">
						<div className="relative inline-block">
							<motion.div
								animate={{
									scale: [1, 1.1, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
								className={`absolute -inset-4 rounded-full blur-2xl ${statusConfig.color.replace("text-", "bg-")}`}
							/>
							<div
								className={`relative z-10 size-24 rounded-full flex items-center justify-center border-4 border-white shadow-xl ${statusConfig.accent}`}
							>
								<StatusIcon className={`size-10 ${statusConfig.color}`} />
							</div>
						</div>

						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight">
								{statusConfig.label}
							</h1>
							<p className="text-muted-foreground max-w-sm mx-auto">
								{statusConfig.description}
							</p>
						</div>

						{/* Quick actions for payment */}
						{urlStatus === "failure" &&
							orderData.status === "PENDING_PAYMENT" && (
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl max-w-sm mx-auto"
								>
									<p className="text-sm text-rose-700 font-medium">
										El pago no se completó. Intenta de nuevo.
									</p>
								</motion.div>
							)}

						{orderData.paymentMethod === "mercadopago" &&
							(orderData.status === "PENDING_PAYMENT" ||
								orderData.status === "CREATED") && (
								<div className="mt-8 max-w-sm mx-auto">
									<Button
										className="w-full bg-[#009EE3] hover:bg-[#0089C7] text-white h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-200"
										onClick={() => retryMpPaymentMutation.mutate(orderData.id)}
										disabled={retryMpPaymentMutation.isPending}
									>
										{retryMpPaymentMutation.isPending ? (
											<>
												<Loader2 className="h-5 w-5 mr-3 animate-spin" />
												Conectando...
											</>
										) : (
											<>
												<CreditCard className="h-5 w-5 mr-3" />
												Pagar con Mercado Pago
											</>
										)}
									</Button>
								</div>
							)}
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
						{/* Left Column: Digital Receipt */}
						<motion.div variants={itemVariants} className="md:col-span-7">
							<div className="relative">
								{/* Receipt Top "Holes" */}
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
									{[...Array(8)].map((_, i) => (
										<div key={i} className="size-2 rounded-full bg-[#faf9f6]" />
									))}
								</div>

								<Card className="border-none shadow-2xl rounded-t-3xl rounded-b-none overflow-hidden bg-white">
									<CardHeader className="pt-10 pb-6 text-center border-b border-dashed border-gray-100">
										<div className="flex justify-center mb-4">
											<div className="p-3 bg-gray-50 rounded-2xl">
												<Receipt className="size-6 text-gray-400" />
											</div>
										</div>
										<CardTitle className="text-xl font-bold uppercase tracking-widest text-gray-800">
											Detalle de Compra
										</CardTitle>
										<p className="text-xs font-mono text-muted-foreground mt-1">
											ID: {orderData.orderNumber.toString().padStart(6, "0")}
										</p>
									</CardHeader>

									<CardContent className="space-y-6 pt-8">
										{/* Items List */}
										<div className="space-y-4">
											{items.map((item: OrderItem) => (
												<div
													key={item.orderItem.id}
													className="flex justify-between items-start gap-4"
												>
													<div className="space-y-1">
														<p className="text-sm font-semibold text-gray-800">
															{item.orderItem.quantity}x{" "}
															{item.orderItem.productName}
														</p>
														{item.modifiers && item.modifiers.length > 0 && (
															<p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed">
																{item.modifiers
																	.map((mod) => mod.optionName)
																	.join(" • ")}
															</p>
														)}
														{item.addons && item.addons.length > 0 && (
															<p className="text-[10px] text-primary/70 uppercase tracking-wider font-medium">
																+{" "}
																{item.addons.map((a) => a.addonName).join(", ")}
															</p>
														)}
													</div>
													<span className="text-sm font-mono font-medium text-gray-600">
														$
														{Number.parseFloat(
															item.orderItem.totalPrice,
														).toFixed(2)}
													</span>
												</div>
											))}
										</div>

										<div className="pt-4 space-y-3 border-t border-dashed border-gray-100">
											<div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest">
												<span>Subtotal</span>
												<span className="font-mono">
													${Number.parseFloat(orderData.subtotal).toFixed(2)}
												</span>
											</div>

											{Number.parseFloat(orderData.deliveryFee || "0") > 0 && (
												<div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest">
													<span>Envío</span>
													<span className="font-mono">
														$
														{Number.parseFloat(orderData.deliveryFee).toFixed(
															2,
														)}
													</span>
												</div>
											)}

											{Number.parseFloat(orderData.discountAmount || "0") >
												0 && (
												<div className="flex justify-between text-xs text-emerald-600 uppercase tracking-widest font-medium">
													<span>Descuento</span>
													<span className="font-mono">
														-$
														{Number.parseFloat(
															orderData.discountAmount,
														).toFixed(2)}
													</span>
												</div>
											)}

											<div className="flex justify-between items-end pt-4">
												<div className="space-y-0.5">
													<span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
														Total Final
													</span>
													<p className="text-sm text-muted-foreground">
														{orderData.paymentMethod === "cash"
															? "Efectivo"
															: "Pago Digital"}
													</p>
												</div>
												<span className="text-3xl font-bold tracking-tight text-gray-900">
													${Number.parseFloat(orderData.total).toFixed(2)}
												</span>
											</div>
										</div>

										{/* Receipt Bottom Info */}
										<div className="pt-8 text-center space-y-4 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
											<p className="text-[10px] font-mono leading-relaxed px-4">
												{new Date(orderData.createdAt).toLocaleDateString(
													"es-AR",
													{
														day: "2-digit",
														month: "2-digit",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
														second: "2-digit",
													},
												)}
												<br />
												¡GRACIAS POR COMPRAR EN COMIDINI!
											</p>
											<div className="flex justify-center">
												<div className="h-12 w-48 bg-gray-100 rounded flex items-center justify-center">
													<div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden flex justify-between px-1">
														{[...Array(12)].map((_, i) => (
															<div key={i} className="w-1 h-full bg-gray-300" />
														))}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Receipt Jagged Edge Bottom */}
								<div
									className="absolute bottom-0 left-0 right-0 h-2 translate-y-full z-10 drop-shadow-[0_4px_3px_rgba(0,0,0,0.05)]"
									style={{
										backgroundImage:
											"linear-gradient(135deg, white 5px, transparent 0), linear-gradient(225deg, white 5px, transparent 0)",
										backgroundSize: "10px 10px",
										backgroundRepeat: "repeat-x",
									}}
								/>
							</div>
						</motion.div>

						{/* Right Column: Order Journey & Details */}
						<div className="md:col-span-5 space-y-8">
							{/* Track Status */}
							<motion.div variants={itemVariants}>
								<Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white h-full">
									<CardHeader>
										<CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
											Tu Pedido
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Stepper
											orientation="vertical"
											defaultValue={data.statusHistory?.length || 1}
										>
											{data.statusHistory?.map(
												(entry: StatusHistoryEntry, index: number) => {
													const config =
														STATUS_CONFIG[entry.status] ||
														STATUS_CONFIG.CREATED;
													return (
														<StepperItem
															key={entry.id}
															step={index + 1}
															completed={true}
														>
															<div className="flex gap-4 w-full">
																<div className="flex flex-col items-center">
																	<StepperIndicator className="border-none bg-primary/10 text-primary ">
																		<config.icon className="size-3" />
																	</StepperIndicator>
																	{index < data.statusHistory.length - 1 && (
																		<StepperSeparator className="bg-primary/20" />
																	)}
																</div>
																<div className="pb-8">
																	<StepperTitle className="text-base font-semibold">
																		{config.label}
																	</StepperTitle>
																	<StepperDescription className="text-xs">
																		{new Date(
																			entry.createdAt,
																		).toLocaleTimeString("es-AR", {
																			hour: "2-digit",
																			minute: "2-digit",
																		})}
																	</StepperDescription>
																</div>
															</div>
														</StepperItem>
													);
												},
											)}
										</Stepper>
									</CardContent>
								</Card>
							</motion.div>

							{/* Delivery/Customer Info */}
							<motion.div variants={itemVariants}>
								<Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
									<CardContent className="pt-6 space-y-6">
										<div className="space-y-4">
											<div className="flex items-center gap-3">
												<div className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
													<Package className="size-5" />
												</div>
												<div>
													<p className="text-xs font-bold uppercase tracking-widest text-gray-400">
														Tipo de Orden
													</p>
													<p className="font-semibold text-gray-800">
														{orderData.type === "delivery"
															? "Delivery"
															: orderData.type === "pickup"
																? "Retiro en Local"
																: "Comer en el Lugar"}
													</p>
												</div>
											</div>

											{orderData.deliveryAddress && (
												<div className="flex items-start gap-3">
													<div className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
														<HomeIcon className="size-5" />
													</div>
													<div>
														<p className="text-xs font-bold uppercase tracking-widest text-gray-400">
															Dirección
														</p>
														<p className="text-sm font-medium text-gray-800 leading-relaxed">
															{orderData.deliveryAddress}
														</p>
													</div>
												</div>
											)}

											<div className="flex items-center gap-3">
												<div className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
													<div className="font-bold text-xs">
														{orderData.customerName.charAt(0)}
													</div>
												</div>
												<div>
													<p className="text-xs font-bold uppercase tracking-widest text-gray-400">
														Cliente
													</p>
													<p className="font-semibold text-gray-800">
														{orderData.customerName}
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
