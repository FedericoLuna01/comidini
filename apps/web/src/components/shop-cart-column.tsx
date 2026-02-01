import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	cartByShopQueryOptions,
	removeCartItemMutationOptions,
	updateCartItemMutationOptions,
} from "../api/cart";
import {
	type CreateOrderData,
	createOrderMutationOptions,
} from "../api/orders";

interface ShopCartColumnProps {
	shopId: number;
}

export function ShopCartColumn({ shopId }: ShopCartColumnProps) {
	const queryClient = useQueryClient();
	const { data: cartData, isPending } = useQuery(
		cartByShopQueryOptions(shopId),
	);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

	// Form state
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [orderType, setOrderType] = useState<"delivery" | "pickup">("pickup");
	const [paymentMethod, setPaymentMethod] = useState<
		"cash" | "card" | "transfer"
	>("cash");
	const [deliveryAddress, setDeliveryAddress] = useState("");
	const [notes, setNotes] = useState("");

	const updateMutation = useMutation({
		...updateCartItemMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart-by-shop", shopId] });
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const removeMutation = useMutation({
		...removeCartItemMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart-by-shop", shopId] });
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			toast.success("Producto eliminado");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const createOrderMutation = useMutation({
		...createOrderMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart-by-shop", shopId] });
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("¡Pedido realizado con éxito!");
			setIsCheckoutOpen(false);
			// Reset form
			setCustomerName("");
			setCustomerPhone("");
			setCustomerEmail("");
			setDeliveryAddress("");
			setNotes("");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleQuantityChange = (
		itemId: number,
		currentQuantity: number,
		delta: number,
	) => {
		const newQuantity = currentQuantity + delta;
		if (newQuantity < 1) {
			removeMutation.mutate(itemId);
		} else if (newQuantity <= 99) {
			updateMutation.mutate({
				itemId,
				updates: { quantity: newQuantity },
			});
		}
	};

	const handleCheckout = () => {
		if (!customerName.trim()) {
			toast.error("El nombre es requerido");
			return;
		}
		if (!customerPhone.trim()) {
			toast.error("El teléfono es requerido");
			return;
		}
		if (orderType === "delivery" && !deliveryAddress.trim()) {
			toast.error("La dirección es requerida para delivery");
			return;
		}

		const orderData: CreateOrderData = {
			shopId,
			customerName,
			customerPhone,
			customerEmail: customerEmail || undefined,
			type: orderType,
			paymentMethod,
			deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
			notes: notes || undefined,
		};

		createOrderMutation.mutate(orderData);
	};

	const calculateTotals = () => {
		if (!cartData?.items) return { subtotal: 0, total: 0 };

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

		return {
			subtotal,
			total: subtotal, // Agregar delivery fee, tax, etc. si aplica
		};
	};

	const totals = calculateTotals();
	const hasItems = cartData?.items && cartData.items.length > 0;

	if (isPending) {
		return (
			<Card className="sticky top-24">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Tu pedido
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-center">Cargando...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="sticky top-24">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShoppingCart className="h-5 w-5" />
					Tu pedido
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{!hasItems ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
						<p className="text-muted-foreground">
							Aún no has agregado productos
						</p>
					</div>
				) : (
					<>
						<div className="space-y-3 max-h-[400px] overflow-y-auto">
							{cartData.items.map((item) => {
								if (!item.product) return null;

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
									(basePrice + variantPrice + addonsPrice + modifiersPrice) *
									item.cartItem.quantity;

								return (
									<div
										key={item.cartItem.id}
										className="flex gap-3 p-2 border rounded-lg"
									>
										{item.product.images?.[0] && (
											<img
												src={item.product.images[0]}
												alt={item.product.name}
												className="h-16 w-16 rounded object-cover"
											/>
										)}
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm truncate">
												{item.product.name}
											</h4>
											{item.variant && (
												<p className="text-xs text-muted-foreground">
													{item.variant.name}
												</p>
											)}
											{item.modifiers && item.modifiers.length > 0 && (
												<p className="text-xs text-muted-foreground">
													{item.modifiers
														.map((mod) => mod.option?.name)
														.filter(Boolean)
														.join(", ")}
												</p>
											)}
											{item.addons.length > 0 && (
												<p className="text-xs text-muted-foreground">
													+{item.addons.length} extras
												</p>
											)}
											<div className="flex items-center justify-between mt-1">
												<div className="flex items-center gap-1">
													<Button
														variant="outline"
														size="icon"
														className="h-6 w-6"
														onClick={() =>
															handleQuantityChange(
																item.cartItem.id,
																item.cartItem.quantity,
																-1,
															)
														}
													>
														<Minus className="h-3 w-3" />
													</Button>
													<span className="w-6 text-center text-sm">
														{item.cartItem.quantity}
													</span>
													<Button
														variant="outline"
														size="icon"
														className="h-6 w-6"
														onClick={() =>
															handleQuantityChange(
																item.cartItem.id,
																item.cartItem.quantity,
																1,
															)
														}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
												<span className="text-sm font-medium">
													${itemTotal.toFixed(2)}
												</span>
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive"
											onClick={() => removeMutation.mutate(item.cartItem.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								);
							})}
						</div>

						<Separator />

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${totals.subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between font-semibold">
								<span>Total</span>
								<span>${totals.total.toFixed(2)}</span>
							</div>
						</div>
					</>
				)}
			</CardContent>

			{hasItems && (
				<CardFooter>
					<Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
						<DialogTrigger asChild>
							<Button className="w-full" size="lg">
								Completar pedido
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Completar pedido</DialogTitle>
								<DialogDescription>
									Ingresa tus datos para realizar el pedido
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="customerName">Nombre *</Label>
									<Input
										id="customerName"
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										placeholder="Tu nombre"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="customerPhone">Teléfono *</Label>
									<Input
										id="customerPhone"
										value={customerPhone}
										onChange={(e) => setCustomerPhone(e.target.value)}
										placeholder="Tu teléfono"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="customerEmail">Email (opcional)</Label>
									<Input
										id="customerEmail"
										type="email"
										value={customerEmail}
										onChange={(e) => setCustomerEmail(e.target.value)}
										placeholder="tu@email.com"
									/>
								</div>
								<div className="space-y-2">
									<Label>Tipo de pedido *</Label>
									<Select
										value={orderType}
										onValueChange={(value) =>
											setOrderType(value as "delivery" | "pickup")
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pickup">Retiro en local</SelectItem>
											<SelectItem value="delivery">Delivery</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{orderType === "delivery" && (
									<div className="space-y-2">
										<Label htmlFor="deliveryAddress">Dirección *</Label>
										<Input
											id="deliveryAddress"
											value={deliveryAddress}
											onChange={(e) => setDeliveryAddress(e.target.value)}
											placeholder="Tu dirección"
										/>
									</div>
								)}
								<div className="space-y-2">
									<Label>Método de pago *</Label>
									<Select
										value={paymentMethod}
										onValueChange={(value) =>
											setPaymentMethod(value as "cash" | "card" | "transfer")
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="cash">Efectivo</SelectItem>
											<SelectItem value="card">Tarjeta</SelectItem>
											<SelectItem value="transfer">Transferencia</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="notes">Notas (opcional)</Label>
									<Input
										id="notes"
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Instrucciones especiales"
									/>
								</div>

								<Separator />

								<div className="flex justify-between font-semibold">
									<span>Total a pagar</span>
									<span>${totals.total.toFixed(2)}</span>
								</div>

								<Button
									className="w-full"
									size="lg"
									onClick={handleCheckout}
									disabled={createOrderMutation.isPending}
								>
									{createOrderMutation.isPending
										? "Procesando..."
										: "Confirmar pedido"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</CardFooter>
			)}
		</Card>
	);
}
