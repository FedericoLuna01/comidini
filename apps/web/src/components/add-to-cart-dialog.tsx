import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { addToCartMutationOptions } from "../api/cart";

interface ProductVariant {
	id: number;
	name: string;
	extraPrice: string | null;
	isActive: boolean;
}

interface ProductAddon {
	id: number;
	name: string;
	description: string | null;
	price: string;
	isRequired: boolean;
	maxQuantity: number;
	isActive: boolean;
}

interface Product {
	id: number;
	shopId: number;
	name: string;
	description: string | null;
	price: string;
	images: string[] | null;
	variants?: ProductVariant[];
	addons?: ProductAddon[];
}

interface AddToCartDialogProps {
	product: Product;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddToCartDialog({
	product,
	open,
	onOpenChange,
}: AddToCartDialogProps) {
	const queryClient = useQueryClient();
	const [quantity, setQuantity] = useState(1);
	const [selectedVariantId, setSelectedVariantId] = useState<
		number | undefined
	>();
	const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>(
		{},
	);
	const [notes, setNotes] = useState("");

	const addMutation = useMutation({
		...addToCartMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			queryClient.invalidateQueries({
				queryKey: ["cart-by-shop", product.shopId],
			});
			toast.success("Producto agregado al carrito");
			onOpenChange(false);
			resetForm();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const resetForm = () => {
		setQuantity(1);
		setSelectedVariantId(undefined);
		setSelectedAddons({});
		setNotes("");
	};

	const handleAddonToggle = (addonId: number) => {
		setSelectedAddons((prev) => {
			const newAddons = { ...prev };
			if (newAddons[addonId]) {
				delete newAddons[addonId];
			} else {
				newAddons[addonId] = 1;
			}
			return newAddons;
		});
	};

	const handleAddonQuantityChange = (addonId: number, newQuantity: number) => {
		const addon = product.addons?.find((a) => a.id === addonId);
		if (!addon) return;

		if (newQuantity < 1) {
			setSelectedAddons((prev) => {
				const newAddons = { ...prev };
				delete newAddons[addonId];
				return newAddons;
			});
		} else if (newQuantity <= addon.maxQuantity) {
			setSelectedAddons((prev) => ({
				...prev,
				[addonId]: newQuantity,
			}));
		}
	};

	const handleSubmit = () => {
		const addons = Object.entries(selectedAddons).map(
			([addonId, quantity]) => ({
				addonId: Number(addonId),
				quantity,
			}),
		);

		addMutation.mutate({
			productId: product.id,
			shopId: product.shopId,
			variantId: selectedVariantId,
			quantity,
			notes: notes.trim() || undefined,
			addons: addons.length > 0 ? addons : [],
		});
	};

	const calculateTotal = () => {
		let total = Number.parseFloat(product.price);

		// Agregar precio de variante
		if (selectedVariantId) {
			const variant = product.variants?.find((v) => v.id === selectedVariantId);
			if (variant?.extraPrice) {
				total += Number.parseFloat(variant.extraPrice);
			}
		}

		// Agregar precio de add-ons
		for (const [addonIdStr, addonQty] of Object.entries(selectedAddons)) {
			const addon = product.addons?.find((a) => a.id === Number(addonIdStr));
			if (addon) {
				total += Number.parseFloat(addon.price) * addonQty;
			}
		}

		return total * quantity;
	};

	const activeVariants = product.variants?.filter((v) => v.isActive) || [];
	const activeAddons = product.addons?.filter((a) => a.isActive) || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{product.name}</DialogTitle>
					{product.description && (
						<DialogDescription>{product.description}</DialogDescription>
					)}
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Imagen del producto */}
					{product.images?.[0] && (
						<div className="w-full h-48 overflow-hidden rounded-lg border">
							<img
								src={product.images[0]}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Variantes */}
					{activeVariants.length > 0 && (
						<div className="space-y-3">
							<Label className="text-base font-semibold">
								Selecciona una opción
							</Label>
							<Select
								value={selectedVariantId?.toString()}
								onValueChange={(value: string) =>
									setSelectedVariantId(Number(value))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona una opción" />
								</SelectTrigger>
								<SelectContent>
									{activeVariants.map((variant) => (
										<SelectItem key={variant.id} value={variant.id.toString()}>
											<div className="flex justify-between items-center w-full">
												<span>{variant.name}</span>
												{variant.extraPrice &&
													Number.parseFloat(variant.extraPrice) > 0 && (
														<span className="text-sm text-muted-foreground ml-2">
															+$
															{Number.parseFloat(variant.extraPrice).toFixed(2)}
														</span>
													)}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{activeVariants.length > 0 && activeAddons.length > 0 && (
						<Separator />
					)}

					{/* Add-ons */}
					{activeAddons.length > 0 && (
						<div className="space-y-3">
							<Label className="text-base font-semibold">
								Extras y complementos
							</Label>
							<div className="space-y-3">
								{activeAddons.map((addon) => {
									const isSelected = !!selectedAddons[addon.id];
									const addonQuantity = selectedAddons[addon.id] || 1;

									return (
										<div key={addon.id} className="space-y-2">
											<div className="flex items-start space-x-3">
												<Checkbox
													id={`addon-${addon.id}`}
													checked={isSelected}
													onCheckedChange={() => handleAddonToggle(addon.id)}
												/>
												<div className="flex-1">
													<Label
														htmlFor={`addon-${addon.id}`}
														className="cursor-pointer flex justify-between items-start"
													>
														<div>
															<span className="font-medium">{addon.name}</span>
															{addon.isRequired && (
																<span className="text-xs text-destructive ml-1">
																	*Requerido
																</span>
															)}
															{addon.description && (
																<p className="text-sm text-muted-foreground">
																	{addon.description}
																</p>
															)}
														</div>
														<span className="text-sm font-medium">
															+${Number.parseFloat(addon.price).toFixed(2)}
														</span>
													</Label>
												</div>
											</div>

											{isSelected && addon.maxQuantity > 1 && (
												<div className="flex items-center gap-2 ml-7">
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														onClick={() =>
															handleAddonQuantityChange(
																addon.id,
																addonQuantity - 1,
															)
														}
														disabled={addonQuantity <= 1}
													>
														<Minus className="h-3 w-3" />
													</Button>
													<Input
														type="number"
														value={addonQuantity}
														onChange={(e) => {
															const val = Number.parseInt(e.target.value);
															if (!Number.isNaN(val)) {
																handleAddonQuantityChange(addon.id, val);
															}
														}}
														className="h-7 w-12 text-center p-0"
														min={1}
														max={addon.maxQuantity}
													/>
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														onClick={() =>
															handleAddonQuantityChange(
																addon.id,
																addonQuantity + 1,
															)
														}
														disabled={addonQuantity >= addon.maxQuantity}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{activeAddons.length > 0 && <Separator />}

					{/* Notas especiales */}
					<div className="space-y-2">
						<Label htmlFor="notes">Notas especiales (opcional)</Label>
						<Textarea
							id="notes"
							placeholder="Ej: Sin cebolla, bien cocido, etc."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							maxLength={500}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{notes.length}/500
						</p>
					</div>

					<Separator />

					{/* Cantidad */}
					<div className="flex items-center justify-between">
						<Label className="text-base font-semibold">Cantidad</Label>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
								disabled={quantity <= 1}
							>
								<Minus className="h-4 w-4" />
							</Button>
							<Input
								type="number"
								value={quantity}
								onChange={(e) => {
									const val = Number.parseInt(e.target.value);
									if (!Number.isNaN(val) && val >= 1 && val <= 99) {
										setQuantity(val);
									}
								}}
								className="w-16 text-center"
								min={1}
								max={99}
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setQuantity(Math.min(99, quantity + 1))}
								disabled={quantity >= 99}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<DialogFooter>
					<div className="flex items-center justify-between w-full">
						<div className="text-xl font-bold">
							Total: ${calculateTotal().toFixed(2)}
						</div>
						<Button
							onClick={handleSubmit}
							disabled={addMutation.isPending}
							size="lg"
						>
							{addMutation.isPending ? "Agregando..." : "Agregar al carrito"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
