import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CartItemWithDetails } from "../api/cart";
import {
	removeCartItemMutationOptions,
	updateCartItemMutationOptions,
} from "../api/cart";

interface CartItemCardProps {
	item: CartItemWithDetails;
}

export function CartItemCard({ item }: CartItemCardProps) {
	const queryClient = useQueryClient();
	const [quantity, setQuantity] = useState(item.cartItem.quantity);

	const updateMutation = useMutation({
		...updateCartItemMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Cantidad actualizada");
		},
		onError: (error) => {
			toast.error(error.message);
			setQuantity(item.cartItem.quantity); // Revertir
		},
	});

	const removeMutation = useMutation({
		...removeCartItemMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Producto eliminado del carrito");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1 || newQuantity > 99) return;
		setQuantity(newQuantity);
		updateMutation.mutate({
			itemId: item.cartItem.id,
			updates: { quantity: newQuantity },
		});
	};

	const handleRemove = () => {
		removeMutation.mutate(item.cartItem.id);
	};

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

	const totalItemPrice = (basePrice + variantPrice + addonsPrice) * quantity;

	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex gap-3">
					{/* Imagen del producto */}
					{item.product.images?.[0] && (
						<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
							<img
								src={item.product.images[0]}
								alt={item.product.name}
								className="h-full w-full object-cover"
							/>
						</div>
					)}

					<div className="flex flex-1 flex-col gap-2">
						{/* Nombre y precio */}
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="font-medium text-sm">{item.product.name}</h3>
								{item.variant && (
									<p className="text-xs text-muted-foreground">
										{item.variant.name}
									</p>
								)}
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive"
								onClick={handleRemove}
								disabled={removeMutation.isPending}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						{/* Add-ons */}
						{item.addons.length > 0 && (
							<div className="text-xs text-muted-foreground">
								{item.addons.map((addonItem) => {
									if (!addonItem.addon) return null;
									return (
										<div key={addonItem.cartItemAddon.id}>
											+ {addonItem.addon.name}
											{addonItem.cartItemAddon.quantity > 1 &&
												` (x${addonItem.cartItemAddon.quantity})`}
										</div>
									);
								})}
							</div>
						)}

						{/* Notas */}
						{item.cartItem.notes && (
							<p className="text-xs text-muted-foreground italic">
								Nota: {item.cartItem.notes}
							</p>
						)}

						{/* Controles de cantidad y precio */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon"
									className="h-7 w-7"
									onClick={() => handleQuantityChange(quantity - 1)}
									disabled={quantity <= 1 || updateMutation.isPending}
								>
									<Minus className="h-3 w-3" />
								</Button>
								<Input
									type="number"
									value={quantity}
									onChange={(e) => {
										const val = Number.parseInt(e.target.value);
										if (!Number.isNaN(val)) handleQuantityChange(val);
									}}
									className="h-7 w-12 text-center p-0"
									min={1}
									max={99}
									disabled={updateMutation.isPending}
								/>
								<Button
									variant="outline"
									size="icon"
									className="h-7 w-7"
									onClick={() => handleQuantityChange(quantity + 1)}
									disabled={quantity >= 99 || updateMutation.isPending}
								>
									<Plus className="h-3 w-3" />
								</Button>
							</div>

							<div className="font-semibold text-sm">
								${totalItemPrice.toFixed(2)}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
