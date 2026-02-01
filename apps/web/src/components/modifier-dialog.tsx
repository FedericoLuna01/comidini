import type {
	ModifierGroupWithOptions,
	SelectModifierOption,
} from "@repo/db/src/types/product";
import { Badge } from "@repo/ui/components/ui/badge";
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
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { addToCartWithModifiersMutationOptions } from "../api/cart";
import { productWithModifiersQueryOptions } from "../api/products";

interface ModifierDialogProps {
	productId: number;
	shopId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface SelectedModifier {
	optionId: number;
	groupId: number;
	quantity: number;
	priceAdjustment: string;
	optionName: string;
	groupName: string;
}

export function ModifierDialog({
	productId,
	shopId,
	open,
	onOpenChange,
}: ModifierDialogProps) {
	const queryClient = useQueryClient();
	const [quantity, setQuantity] = useState(1);
	const [selectedModifiers, setSelectedModifiers] = useState<
		Record<number, SelectedModifier[]>
	>({});
	const [notes, setNotes] = useState("");
	const [validationErrors, setValidationErrors] = useState<
		Record<number, string>
	>({});

	const resetForm = useCallback(() => {
		setQuantity(1);
		setSelectedModifiers({});
		setNotes("");
		setValidationErrors({});
	}, []);

	const { data: product, isLoading } = useQuery({
		...productWithModifiersQueryOptions(productId),
		enabled: open && !!productId,
	});

	// Reset form when dialog opens
	useEffect(() => {
		if (open && product) {
			resetForm();
			// Pre-select default options
			const defaultSelections: Record<number, SelectedModifier[]> = {};
			for (const group of product.modifierGroups) {
				const defaultOptions = group.options.filter(
					(opt) => opt.isDefault && opt.isActive,
				);
				if (defaultOptions.length > 0) {
					defaultSelections[group.id] = defaultOptions.map((opt) => ({
						optionId: opt.id,
						groupId: group.id,
						quantity: 1,
						priceAdjustment: opt.priceAdjustment ?? "0",
						optionName: opt.name,
						groupName: group.name,
					}));
				}
			}
			setSelectedModifiers(defaultSelections);
		}
	}, [open, product, resetForm]);

	const addMutation = useMutation({
		...addToCartWithModifiersMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			queryClient.invalidateQueries({
				queryKey: ["cart-by-shop", shopId],
			});
			toast.success("Producto agregado al carrito");
			onOpenChange(false);
			resetForm();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSingleSelect = (
		group: ModifierGroupWithOptions,
		option: SelectModifierOption,
	) => {
		setSelectedModifiers((prev) => ({
			...prev,
			[group.id]: [
				{
					optionId: option.id,
					groupId: group.id,
					quantity: 1,
					priceAdjustment: option.priceAdjustment ?? "0",
					optionName: option.name,
					groupName: group.name,
				},
			],
		}));
		// Clear validation error for this group
		setValidationErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[group.id];
			return newErrors;
		});
	};

	const handleMultiSelect = (
		group: ModifierGroupWithOptions,
		option: SelectModifierOption,
		checked: boolean,
	) => {
		setSelectedModifiers((prev) => {
			const groupSelections = prev[group.id] || [];
			const maxSelection = group.maxSelection ?? 1;

			if (checked) {
				// Check if we're at max selections
				if (groupSelections.length >= maxSelection) {
					toast.error(`Máximo ${maxSelection} opciones permitidas`);
					return prev;
				}
				return {
					...prev,
					[group.id]: [
						...groupSelections,
						{
							optionId: option.id,
							groupId: group.id,
							quantity: 1,
							priceAdjustment: option.priceAdjustment ?? "0",
							optionName: option.name,
							groupName: group.name,
						},
					],
				};
			} else {
				return {
					...prev,
					[group.id]: groupSelections.filter((s) => s.optionId !== option.id),
				};
			}
		});

		// Clear validation error for this group
		setValidationErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[group.id];
			return newErrors;
		});
	};

	const isOptionSelected = (groupId: number, optionId: number) => {
		return (
			selectedModifiers[groupId]?.some((s) => s.optionId === optionId) ?? false
		);
	};

	const validateSelections = (): boolean => {
		if (!product) return false;

		const errors: Record<number, string> = {};

		for (const group of product.modifierGroups) {
			if (!group.isActive) continue;

			const minSelection = group.minSelection ?? 0;
			const selections = selectedModifiers[group.id]?.length ?? 0;

			if (selections < minSelection) {
				if (minSelection === 1) {
					errors[group.id] = "Selección obligatoria";
				} else {
					errors[group.id] = `Selecciona al menos ${minSelection} opciones`;
				}
			}
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateSelections()) {
			toast.error("Por favor completa las selecciones obligatorias");
			return;
		}

		// Flatten all selected modifiers
		const allModifiers = Object.values(selectedModifiers)
			.flat()
			.map((mod) => ({
				modifierOptionId: mod.optionId,
				quantity: mod.quantity,
				priceAdjustment: mod.priceAdjustment,
			}));

		addMutation.mutate({
			productId,
			shopId,
			quantity,
			notes: notes.trim() || undefined,
			modifiers: allModifiers,
			addons: [], // Legacy support
		});
	};

	const calculateTotal = () => {
		if (!product) return 0;

		let total = Number.parseFloat(product.price);

		// Add modifier prices
		for (const modifiers of Object.values(selectedModifiers)) {
			for (const mod of modifiers) {
				total += Number.parseFloat(mod.priceAdjustment) * mod.quantity;
			}
		}

		return total * quantity;
	};

	const getGroupSelectionLabel = (group: ModifierGroupWithOptions) => {
		const min = group.minSelection ?? 0;
		const max = group.maxSelection ?? 1;

		if (min >= 1 && max === 1) return "Obligatorio • Elige 1";
		if (min >= 1) return `Obligatorio • Elige ${min}-${max}`;
		if (max === 1) return "Opcional • Máx. 1";
		return `Opcional • Máx. ${max}`;
	};

	if (isLoading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl">
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!product) {
		return null;
	}

	const activeModifierGroups = product.modifierGroups.filter(
		(g) => g.isActive && g.options.some((o) => o.isActive),
	);

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
					{/* Product Image */}
					{product.images?.[0] && (
						<div className="w-full h-48 overflow-hidden rounded-lg border">
							<img
								src={product.images[0]}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Modifier Groups */}
					{activeModifierGroups.map((group) => {
						const isSingleSelect = (group.maxSelection ?? 1) === 1;
						const activeOptions = group.options.filter((o) => o.isActive);
						const hasError = !!validationErrors[group.id];

						return (
							<div key={group.id} className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Label className="text-base font-semibold">
											{group.name}
										</Label>
										<Badge
											variant={
												(group.minSelection ?? 0) >= 1 ? "default" : "secondary"
											}
										>
											{getGroupSelectionLabel(group)}
										</Badge>
									</div>
									{hasError && (
										<div className="flex items-center gap-1 text-destructive text-sm">
											<AlertCircle className="h-4 w-4" />
											{validationErrors[group.id]}
										</div>
									)}
								</div>

								{group.description && (
									<p className="text-sm text-muted-foreground">
										{group.description}
									</p>
								)}

								{isSingleSelect ? (
									// Single selection - use clickable divs to allow deselection for optional groups
									<div
										className={`space-y-2 ${hasError ? "ring-2 ring-destructive rounded-md p-2" : ""}`}
									>
										{activeOptions.map((option) => {
											const isSelected = isOptionSelected(group.id, option.id);
											const isOptional = (group.minSelection ?? 0) === 0;

											return (
												<button
													type="button"
													key={option.id}
													className={`w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
														isSelected
															? "bg-primary/10 border-2 border-primary"
															: "bg-muted/50 hover:bg-muted border-2 border-transparent"
													}`}
													onClick={() => {
														if (isSelected && isOptional) {
															// Deselect if optional and already selected
															setSelectedModifiers((prev) => {
																const newState = { ...prev };
																delete newState[group.id];
																return newState;
															});
														} else {
															handleSingleSelect(group, option);
														}
													}}
												>
													<div className="flex items-center gap-3">
														<div
															className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
																isSelected
																	? "border-primary"
																	: "border-muted-foreground"
															}`}
														>
															{isSelected && (
																<div className="h-2 w-2 rounded-full bg-primary" />
															)}
														</div>
														<span className="flex-1 text-left">
															{option.name}
															{option.isDefault && (
																<span className="text-xs text-muted-foreground ml-2">
																	(Por defecto)
																</span>
															)}
														</span>
													</div>
													<span className="text-sm font-medium">
														{Number(option.priceAdjustment) > 0
															? `+$${Number(option.priceAdjustment).toFixed(2)}`
															: "Sin cargo"}
													</span>
												</button>
											);
										})}
									</div>
								) : (
									// Checkboxes for multi-selection
									<div
										className={`space-y-2 ${hasError ? "ring-2 ring-destructive rounded-md p-2" : ""}`}
									>
										{activeOptions.map((option) => {
											const isSelected = isOptionSelected(group.id, option.id);
											return (
												<div
													key={option.id}
													className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
												>
													<div className="flex items-center gap-3">
														<Checkbox
															id={`option-${option.id}`}
															checked={isSelected}
															onCheckedChange={(checked) =>
																handleMultiSelect(
																	group,
																	option,
																	checked === true,
																)
															}
														/>
														<Label
															htmlFor={`option-${option.id}`}
															className="cursor-pointer flex-1"
														>
															{option.name}
															{option.isDefault && (
																<span className="text-xs text-muted-foreground ml-2">
																	(Por defecto)
																</span>
															)}
														</Label>
													</div>
													<span className="text-sm font-medium">
														{Number(option.priceAdjustment) > 0
															? `+$${Number(option.priceAdjustment).toFixed(2)}`
															: "Sin cargo"}
													</span>
												</div>
											);
										})}
									</div>
								)}

								<Separator />
							</div>
						);
					})}

					{/* Special Notes */}
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

					{/* Quantity */}
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

					{/* Selected Options Summary */}
					{Object.keys(selectedModifiers).length > 0 && (
						<div className="bg-muted/50 rounded-lg p-4 space-y-2">
							<Label className="text-sm font-medium">
								Resumen de selecciones:
							</Label>
							<div className="text-sm text-muted-foreground space-y-1">
								{Object.values(selectedModifiers)
									.flat()
									.map((mod, idx) => (
										<div key={idx} className="flex justify-between">
											<span>
												{mod.groupName}: {mod.optionName}
											</span>
											{Number(mod.priceAdjustment) > 0 && (
												<span>+${Number(mod.priceAdjustment).toFixed(2)}</span>
											)}
										</div>
									))}
							</div>
						</div>
					)}
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
