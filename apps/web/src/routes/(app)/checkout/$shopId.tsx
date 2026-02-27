import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Banknote,
	ChevronRight,
	CreditCard,
	Loader2,
	Lock,
	MapPin,
	ShoppingBag,
	Store,
	Truck,
} from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cartByShopQueryOptions } from "../../../api/cart";
import {
	type CreateOrderData,
	createMpPreferenceMutationOptions,
	createOrderMutationOptions,
} from "../../../api/orders";
import { shopByIdQueryOptions } from "../../../api/shops";

const checkoutFormSchema = z
	.object({
		customerName: z.string().min(1, "El nombre es requerido"),
		customerPhone: z.string().min(1, "El teléfono es requerido"),
		orderType: z.enum(["delivery", "pickup"], {
			required_error: "Selecciona un tipo de entrega",
		}),
		paymentMethod: z.enum(["cash", "mercadopago"], {
			required_error: "Selecciona un método de pago",
		}),
		deliveryAddress: z.string().optional(),
		notes: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.orderType === "delivery") {
				return data.deliveryAddress && data.deliveryAddress.trim().length > 0;
			}
			return true;
		},
		{
			message: "La dirección es requerida para delivery",
			path: ["deliveryAddress"],
		},
	);

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const Route = createFileRoute("/(app)/checkout/$shopId")({
	component: CheckoutPage,
});

function CheckoutPage() {
	const { shopId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const submitGuard = useRef(false);

	const { data: session, isPending: sessionPending } = authClient.useSession();

	const numericShopId = Number(shopId);

	const { data: shop, isPending: shopPending } = useQuery(
		shopByIdQueryOptions(numericShopId),
	);

	const { data: cartData, isPending: cartPending } = useQuery(
		cartByShopQueryOptions(numericShopId),
	);

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: {
			customerName: "",
			customerPhone: "",
			orderType: "pickup",
			paymentMethod: "cash",
			deliveryAddress: "",
			notes: "",
		},
	});

	const orderType = form.watch("orderType");
	const paymentMethod = form.watch("paymentMethod");

	const createOrderMutation = useMutation({
		...createOrderMutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["cart-by-shop", numericShopId],
			});
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			queryClient.invalidateQueries({ queryKey: ["cart"] });

			const currentPaymentMethod = form.getValues("paymentMethod");
			if (currentPaymentMethod === "mercadopago") {
				createMpPreferenceMutation.mutate(data.order.id);
			} else {
				toast.success("¡Pedido realizado con éxito!");
				navigate({
					to: "/pedido/$orderId",
					params: { orderId: String(data.order.id) },
				});
			}
		},
		onError: (error) => {
			toast.error(error.message);
			submitGuard.current = false;
		},
	});

	const createMpPreferenceMutation = useMutation({
		...createMpPreferenceMutationOptions(),
		onSuccess: (data) => {
			// Redirect to Mercado Pago
			window.location.href = data.initPoint;
		},
		onError: (error) => {
			toast.error(`Error al crear el pago con Mercado Pago: ${error.message}`);
			submitGuard.current = false;
		},
	});

	// Redirect to login if not authenticated
	if (!sessionPending && !session?.user) {
		const currentPath = `/checkout/${shopId}`;
		navigate({
			to: "/iniciar-sesion",
			search: { redirect: currentPath },
		});
		return null;
	}

	const calculateTotals = () => {
		if (!cartData?.items)
			return { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 };

		let subtotal = 0;

		for (const item of cartData.items) {
			if (!item.product) continue;

			const basePrice = Number.parseFloat(item.product.price);
			const variantPrice = item.variant?.extraPrice
				? Number.parseFloat(item.variant.extraPrice)
				: 0;
			const addonsPrice = item.addons.reduce((sum, addonItem) => {
				if (!addonItem.addon) return sum;
				return (
					sum +
					Number.parseFloat(addonItem.addon.price) *
						addonItem.cartItemAddon.quantity
				);
			}, 0);
			const modifiersPrice = (item.modifiers ?? []).reduce((sum, modItem) => {
				if (!modItem.option) return sum;
				return (
					sum +
					Number.parseFloat(modItem.option.priceAdjustment) *
						modItem.cartItemModifier.quantity
				);
			}, 0);

			subtotal +=
				(basePrice + variantPrice + addonsPrice + modifiersPrice) *
				item.cartItem.quantity;
		}

		const deliveryFee =
			orderType === "delivery" && shop?.deliveryFee
				? Number.parseFloat(shop.deliveryFee)
				: 0;

		const cashDiscount =
			paymentMethod === "cash" &&
			shop?.cashDiscountPercentage &&
			Number.parseFloat(shop.cashDiscountPercentage) > 0
				? subtotal * (Number.parseFloat(shop.cashDiscountPercentage) / 100)
				: 0;

		const total = subtotal + deliveryFee - cashDiscount;

		return { subtotal, deliveryFee, discount: cashDiscount, total };
	};

	const totals = calculateTotals();
	const hasItems = cartData?.items && cartData.items.length > 0;
	const isSubmitting =
		createOrderMutation.isPending || createMpPreferenceMutation.isPending;

	const onSubmit = (values: CheckoutFormValues) => {
		if (submitGuard.current) return;

		if (values.paymentMethod === "mercadopago" && !shop?.mpEnabled) {
			toast.error("Esta tienda no tiene Mercado Pago configurado");
			return;
		}

		submitGuard.current = true;

		const orderData: CreateOrderData = {
			shopId: numericShopId,
			customerName: values.customerName,
			customerPhone: values.customerPhone,
			customerEmail: session?.user?.email || undefined,
			type: values.orderType,
			paymentMethod: values.paymentMethod,
			deliveryAddress:
				values.orderType === "delivery" ? values.deliveryAddress : undefined,
			notes: values.notes || undefined,
		};

		createOrderMutation.mutate(orderData);
	};

	if (sessionPending || shopPending || cartPending) {
		return (
			<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!shop) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<div className="bg-destructive/10 text-destructive rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
					<Lock className="h-8 w-8" />
				</div>
				<h2 className="text-xl font-bold mb-2">Tienda no encontrada</h2>
				<p className="text-muted-foreground mb-6">
					Lo sentimos, no pudimos encontrar la tienda solicitada.
				</p>
				<Button onClick={() => navigate({ to: "/buscar" })}>
					Volver a buscar
				</Button>
			</div>
		);
	}

	if (!hasItems) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
					<ShoppingBag className="h-10 w-10 text-muted-foreground" />
				</div>
				<h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
				<p className="text-muted-foreground mb-8 max-w-md mx-auto">
					Parece que aún no has agregado productos de {shop.name} a tu carrito.
				</p>
				<Button
					size="lg"
					onClick={() =>
						navigate({
							to: "/tiendas/$shopId",
							params: { shopId: String(numericShopId) },
						})
					}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Volver a la tienda
				</Button>
			</div>
		);
	}

	const canDelivery = shop.acceptsDelivery !== false;
	const canPickup = shop.acceptsPickup !== false;
	const canCash = shop.acceptsCash !== false;
	const canMp = shop.mpEnabled === true;

	const formatCurrency = (amount: number) => {
		return amount.toLocaleString("es-AR", {
			style: "currency",
			currency: "ARS",
			minimumFractionDigits: 2,
		});
	};

	return (
		<div className="bg-muted/30 min-h-screen pb-20">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Breadcrumbs/Back */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
					<button
						type="button"
						onClick={() =>
							navigate({
								to: "/tiendas/$shopId",
								params: { shopId: String(numericShopId) },
							})
						}
						className="hover:text-foreground transition-colors flex items-center gap-1"
					>
						{shop.name}
					</button>
					<ChevronRight className="h-4 w-4" />
					<span className="text-foreground font-medium">Checkout</span>
				</div>

				<div className="flex flex-col gap-2 mb-8">
					<h1 className="text-3xl font-extrabold tracking-tight">
						Finalizar Pedido
					</h1>
					<p className="text-muted-foreground flex items-center gap-2">
						<Store className="h-4 w-4" />
						Comprando en{" "}
						<span className="font-semibold text-foreground">{shop.name}</span>
					</p>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
					>
						{/* Left Column - Steps */}
						<div className="lg:col-span-7 space-y-6">
							{/* Step 1: Contact */}
							<Card className="shadow-sm border-none ring-1 ring-border">
								<CardHeader className="pb-4 flex flex-row items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
										1
									</div>
									<CardTitle className="text-xl">
										Información de contacto
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="customerName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
														Nombre Completo
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Juan Pérez"
															className="bg-muted/20 focus-visible:ring-primary"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="customerPhone"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
														Teléfono
													</FormLabel>
													<FormControl>
														<Input
															placeholder="11 1234 5678"
															className="bg-muted/20 focus-visible:ring-primary"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="space-y-2">
										<Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
											Email
										</Label>
										<Input
											value={session?.user?.email || ""}
											disabled
											className="bg-muted/50 border-dashed"
										/>
									</div>
								</CardContent>
							</Card>

							{/* Step 2: Delivery */}
							<Card className="shadow-sm border-none ring-1 ring-border">
								<CardHeader className="pb-4 flex flex-row items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
										2
									</div>
									<CardTitle className="text-xl">Método de entrega</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<FormField
										control={form.control}
										name="orderType"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<RadioGroup
														value={field.value}
														onValueChange={field.onChange}
														className="grid grid-cols-1 sm:grid-cols-2 gap-4"
													>
														{canPickup && (
															<div className="relative">
																<RadioGroupItem
																	value="pickup"
																	id="pickup"
																	className="peer sr-only"
																/>
																<Label
																	htmlFor="pickup"
																	className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
																>
																	<ShoppingBag className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
																	<div className="text-center">
																		<p className="font-bold text-sm uppercase">
																			Retiro en local
																		</p>
																		<p className="text-xs text-muted-foreground mt-1">
																			Sin costo adicional
																		</p>
																	</div>
																</Label>
															</div>
														)}
														{canDelivery && (
															<div className="relative">
																<RadioGroupItem
																	value="delivery"
																	id="delivery"
																	className="peer sr-only"
																/>
																<Label
																	htmlFor="delivery"
																	className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
																>
																	<Truck className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
																	<div className="text-center">
																		<p className="font-bold text-sm uppercase">
																			Delivery
																		</p>
																		<p className="text-xs text-muted-foreground mt-1 tabular-nums">
																			{shop.deliveryFee
																				? `Envío: ${formatCurrency(Number.parseFloat(shop.deliveryFee))}`
																				: "¡Envío gratis!"}
																		</p>
																	</div>
																</Label>
															</div>
														)}
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{orderType === "delivery" && (
										<FormField
											control={form.control}
											name="deliveryAddress"
											render={({ field }) => (
												<FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
													<FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-2">
														<MapPin className="h-3 w-3" />
														Dirección de entrega
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Calle 123, Depto 4B, Ciudad"
															className="bg-muted/20 focus-visible:ring-primary"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</CardContent>
							</Card>

							{/* Step 3: Payment */}
							<Card className="shadow-sm border-none ring-1 ring-border">
								<CardHeader className="pb-4 flex flex-row items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
										3
									</div>
									<CardTitle className="text-xl">Método de pago</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<FormField
										control={form.control}
										name="paymentMethod"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<RadioGroup
														value={field.value}
														onValueChange={field.onChange}
														className="grid grid-cols-1 sm:grid-cols-2 gap-4"
													>
														{canCash && (
															<div className="relative">
																<RadioGroupItem
																	value="cash"
																	id="cash"
																	className="peer sr-only"
																/>
																<Label
																	htmlFor="cash"
																	className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
																>
																	<Banknote className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
																	<div className="text-center">
																		<p className="font-bold text-sm uppercase">
																			Efectivo
																		</p>
																		{shop.cashDiscountPercentage &&
																		Number.parseFloat(
																			shop.cashDiscountPercentage,
																		) > 0 ? (
																			<Badge
																				variant="secondary"
																				className="mt-1 bg-green-100 text-green-700 hover:bg-green-100 border-none"
																			>
																				-{shop.cashDiscountPercentage}% desc.
																			</Badge>
																		) : (
																			<p className="text-xs text-muted-foreground mt-1">
																				Paga al recibir
																			</p>
																		)}
																	</div>
																</Label>
															</div>
														)}
														{canMp && (
															<div className="relative">
																<RadioGroupItem
																	value="mercadopago"
																	id="mercadopago"
																	className="peer sr-only"
																/>
																<Label
																	htmlFor="mercadopago"
																	className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#009EE3] [&:has([data-state=checked])]:border-[#009EE3] cursor-pointer transition-all h-full"
																>
																	<div className="bg-[#009EE3] p-1.5 rounded-lg mb-3">
																		<CreditCard className="h-4 w-4 text-white" />
																	</div>
																	<div className="text-center">
																		<p className="font-bold text-sm uppercase text-[#009EE3]">
																			Mercado Pago
																		</p>
																		<p className="text-xs text-muted-foreground mt-1">
																			Todas las tarjetas
																		</p>
																	</div>
																</Label>
															</div>
														)}
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{!canCash && !canMp && (
										<div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium border border-destructive/20">
											Esta tienda no tiene métodos de pago configurados. Por
											favor, contacta al negocio.
										</div>
									)}

									<div className="pt-2">
										<FormField
											control={form.control}
											name="notes"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
														Notas adicionales (opcional)
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="¿Algo que debamos saber sobre tu pedido o la entrega?"
															className="bg-muted/20 focus-visible:ring-primary min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Right Column - Summary */}
						<div className="lg:col-span-5">
							<Card className="sticky top-24 shadow-lg border-none ring-1 ring-border overflow-hidden">
								<CardHeader className="bg-primary/5 pb-6">
									<CardTitle className="text-xl flex items-center gap-2">
										<ShoppingBag className="h-5 w-5 text-primary" />
										Tu pedido
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-6 space-y-6">
									{/* Items List */}
									<div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
										{cartData?.items.map((item) => {
											if (!item.product) return null;

											const basePrice = Number.parseFloat(item.product.price);
											const variantPrice = item.variant?.extraPrice
												? Number.parseFloat(item.variant.extraPrice)
												: 0;
											const addonsPrice = item.addons.reduce(
												(sum, addonItem) => {
													if (!addonItem.addon) return sum;
													return (
														sum +
														Number.parseFloat(addonItem.addon.price) *
															addonItem.cartItemAddon.quantity
													);
												},
												0,
											);
											const modifiersPrice = (item.modifiers ?? []).reduce(
												(sum, modItem) => {
													if (!modItem.option) return sum;
													return (
														sum +
														Number.parseFloat(modItem.option.priceAdjustment) *
															modItem.cartItemModifier.quantity
													);
												},
												0,
											);
											const itemTotal =
												(basePrice +
													variantPrice +
													addonsPrice +
													modifiersPrice) *
												item.cartItem.quantity;

											return (
												<div
													key={item.cartItem.id}
													className="flex gap-4 group"
												>
													<div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
														{item.product.images?.[0] ? (
															<img
																src={item.product.images[0]}
																alt={item.product.name}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="h-full w-full flex items-center justify-center">
																<ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex justify-between items-start gap-2">
															<p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
																<span className="text-primary mr-1">
																	{item.cartItem.quantity}x
																</span>
																{item.product.name}
															</p>
															<span className="text-sm font-bold tabular-nums whitespace-nowrap">
																{formatCurrency(itemTotal)}
															</span>
														</div>
														{item.variant && (
															<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">
																Variante: {item.variant.name}
															</p>
														)}
														{item.modifiers && item.modifiers.length > 0 && (
															<div className="flex flex-wrap gap-1 mt-1">
																{item.modifiers.map((mod) => (
																	<span
																		key={mod.cartItemModifier.id}
																		className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
																	>
																		{mod.option?.name}
																	</span>
																))}
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>

									<Separator className="opacity-50" />

									{/* Totals Section */}
									<div className="space-y-3 pt-2">
										<div className="flex justify-between text-sm items-center">
											<span className="text-muted-foreground font-medium">
												Subtotal
											</span>
											<span className="tabular-nums font-semibold text-foreground">
												{formatCurrency(totals.subtotal)}
											</span>
										</div>
										{totals.deliveryFee > 0 && (
											<div className="flex justify-between text-sm items-center">
												<span className="text-muted-foreground font-medium">
													Costo de envío
												</span>
												<span className="tabular-nums font-semibold text-foreground">
													{formatCurrency(totals.deliveryFee)}
												</span>
											</div>
										)}
										{totals.discount > 0 && (
											<div className="flex justify-between text-sm items-center text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
												<span className="font-bold flex items-center gap-1.5">
													<Badge
														variant="secondary"
														className="bg-green-100 text-green-700 h-5 px-1 font-bold"
													>
														-{shop.cashDiscountPercentage}%
													</Badge>
													Ahorro en efectivo
												</span>
												<span className="tabular-nums font-bold">
													-{formatCurrency(totals.discount)}
												</span>
											</div>
										)}

										<div className="pt-2">
											<div className="flex justify-between items-end bg-primary/5 p-4 rounded-xl border border-primary/10">
												<div>
													<span className="text-xs uppercase font-extrabold text-primary/70 tracking-widest block mb-0.5">
														Total a pagar
													</span>
													<span className="text-3xl font-black tabular-nums text-primary tracking-tighter">
														{formatCurrency(totals.total)}
													</span>
												</div>
												<Lock className="h-4 w-4 text-primary/40 mb-1" />
											</div>
										</div>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col gap-3 pb-8">
									<Button
										type="submit"
										className={`w-full h-14 text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
											paymentMethod === "mercadopago"
												? "bg-[#009EE3] hover:bg-[#0089C7] text-white"
												: "bg-primary hover:bg-primary/90"
										}`}
										disabled={isSubmitting || (!canCash && !canMp)}
									>
										{isSubmitting ? (
											<div className="flex items-center gap-2">
												<Loader2 className="h-5 w-5 animate-spin" />
												<span>Procesando…</span>
											</div>
										) : (
											<div className="flex items-center justify-center gap-2">
												{paymentMethod === "mercadopago" ? (
													<>
														<span>Pagar con Mercado Pago</span>
														<ChevronRight className="h-5 w-5 opacity-50" />
													</>
												) : (
													<>
														<span>Confirmar Pedido</span>
														<ChevronRight className="h-5 w-5 opacity-50" />
													</>
												)}
											</div>
										)}
									</Button>

									<p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
										<Lock className="h-3 w-3" />
										Transacción segura y encriptada
									</p>
								</CardFooter>
							</Card>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
