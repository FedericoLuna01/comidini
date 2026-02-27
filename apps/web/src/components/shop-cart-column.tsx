import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
	cartByShopQueryOptions,
	removeCartItemMutationOptions,
	updateCartItemMutationOptions,
} from "../api/cart";

interface ShopCartColumnProps {
	shopId: number;
}

export function ShopCartColumn({ shopId }: ShopCartColumnProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { data: cartData, isPending } = useQuery(
		cartByShopQueryOptions(shopId),
	);

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

	const handleGoToCheckout = () => {
		navigate({ to: "/checkout/$shopId", params: { shopId: String(shopId) } });
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
					<Button className="w-full" size="lg" onClick={handleGoToCheckout}>
						Completar pedido
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
