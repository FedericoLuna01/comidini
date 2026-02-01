import type {
	CreateModifierGroupWithOptionsSchema,
	ModifierGroupWithOptions,
} from "@repo/db/src/types/product";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	createModifierGroup,
	deleteModifierGroup,
	modifierGroupsQueryOptions,
	updateModifierGroup,
} from "../api/products";
import { ModifierGroupForm } from "./modifier-group-form";

interface ModifierGroupsManagerProps {
	productId: number;
}

export function ModifierGroupsManager({
	productId,
}: ModifierGroupsManagerProps) {
	const queryClient = useQueryClient();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingGroup, setEditingGroup] =
		useState<ModifierGroupWithOptions | null>(null);
	const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);

	const { data: modifierGroups = [], isLoading } = useQuery(
		modifierGroupsQueryOptions(productId),
	);

	const createMutation = useMutation({
		mutationFn: (data: CreateModifierGroupWithOptionsSchema) =>
			createModifierGroup(productId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-modifier-groups", productId],
			});
			queryClient.invalidateQueries({
				queryKey: ["get-product-with-modifiers", productId],
			});
			toast.success("Grupo de modificadores creado");
			setIsDialogOpen(false);
			setEditingGroup(null);
		},
		onError: () => {
			toast.error("Error al crear el grupo");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			groupId,
			data,
		}: {
			groupId: number;
			data: CreateModifierGroupWithOptionsSchema;
		}) => updateModifierGroup(groupId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-modifier-groups", productId],
			});
			queryClient.invalidateQueries({
				queryKey: ["get-product-with-modifiers", productId],
			});
			toast.success("Grupo actualizado");
			setIsDialogOpen(false);
			setEditingGroup(null);
		},
		onError: () => {
			toast.error("Error al actualizar el grupo");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteModifierGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-modifier-groups", productId],
			});
			queryClient.invalidateQueries({
				queryKey: ["get-product-with-modifiers", productId],
			});
			toast.success("Grupo eliminado");
			setDeletingGroupId(null);
		},
		onError: () => {
			toast.error("Error al eliminar el grupo");
		},
	});

	const handleSubmit = (data: CreateModifierGroupWithOptionsSchema) => {
		if (editingGroup) {
			updateMutation.mutate({ groupId: editingGroup.id, data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleDelete = () => {
		if (deletingGroupId) {
			deleteMutation.mutate(deletingGroupId);
		}
	};

	const getSelectionLabel = (group: ModifierGroupWithOptions) => {
		const min = group.minSelection ?? 0;
		const max = group.maxSelection ?? 1;

		if (min >= 1 && max === 1) return "Obligatorio (1)";
		if (min >= 1) return `Obligatorio (${min}-${max})`;
		if (max === 1) return "Opcional (máx. 1)";
		return `Opcional (máx. ${max})`;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Grupos de Modificadores</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-2">
						<div className="h-12 bg-muted rounded" />
						<div className="h-12 bg-muted rounded" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div>
						<CardTitle>Grupos de Modificadores</CardTitle>
						<CardDescription>
							Configura las opciones y extras disponibles para este producto
						</CardDescription>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Agregar grupo
					</Button>
				</CardHeader>
				<CardContent>
					{modifierGroups.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>No hay grupos de modificadores configurados.</p>
							<p className="text-sm">
								Agrega grupos como "Tamaño", "Extras" o "Salsas" para permitir
								personalización.
							</p>
						</div>
					) : (
						<Accordion type="single" collapsible className="w-full">
							{modifierGroups.map((group) => (
								<AccordionItem key={group.id} value={`group-${group.id}`}>
									<AccordionTrigger className="hover:no-underline">
										<div className="flex items-center gap-3 flex-1 text-left">
											<span className="font-medium">{group.name}</span>
											<Badge
												variant={
													(group.minSelection ?? 0) >= 1
														? "default"
														: "secondary"
												}
											>
												{getSelectionLabel(group)}
											</Badge>
											{!group.isActive && (
												<Badge variant="outline">Inactivo</Badge>
											)}
											<span className="text-muted-foreground text-sm ml-auto mr-2">
												{group.options.length} opciones
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-4 pt-2">
											{group.description && (
												<p className="text-sm text-muted-foreground">
													{group.description}
												</p>
											)}

											<div className="grid gap-2">
												{group.options.map((option) => (
													<div
														key={option.id}
														className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
													>
														<div className="flex items-center gap-2">
															<span>{option.name}</span>
															{option.isDefault && (
																<Badge variant="outline" className="text-xs">
																	Por defecto
																</Badge>
															)}
															{!option.isActive && (
																<Badge variant="secondary" className="text-xs">
																	Inactivo
																</Badge>
															)}
														</div>
														<span className="text-sm font-medium">
															{Number(option.priceAdjustment) > 0
																? `+$${Number(option.priceAdjustment).toFixed(2)}`
																: "Sin cargo"}
														</span>
													</div>
												))}
											</div>

											<div className="flex gap-2 pt-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setEditingGroup(group);
														setIsDialogOpen(true);
													}}
												>
													<Edit2 className="h-3 w-3 mr-1" />
													Editar
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-destructive hover:text-destructive"
													onClick={() => setDeletingGroupId(group.id)}
												>
													<Trash2 className="h-3 w-3 mr-1" />
													Eliminar
												</Button>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</CardContent>
			</Card>

			{/* Dialog for creating/editing modifier group */}
			<Dialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setEditingGroup(null);
				}}
			>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingGroup
								? "Editar grupo de modificadores"
								: "Nuevo grupo de modificadores"}
						</DialogTitle>
						<DialogDescription>
							{editingGroup
								? "Modifica las opciones del grupo"
								: "Crea un nuevo grupo con sus opciones"}
						</DialogDescription>
					</DialogHeader>
					<ModifierGroupForm
						onSubmit={handleSubmit}
						onCancel={() => {
							setIsDialogOpen(false);
							setEditingGroup(null);
						}}
						initialData={
							editingGroup
								? {
										name: editingGroup.name,
										description: editingGroup.description ?? undefined,
										minSelection: editingGroup.minSelection ?? 0,
										maxSelection: editingGroup.maxSelection ?? 1,
										isActive: editingGroup.isActive ?? true,
										sortOrder: editingGroup.sortOrder ?? 0,
										options: editingGroup.options.map((opt) => ({
											id: opt.id,
											name: opt.name,
											description: opt.description ?? undefined,
											priceAdjustment: opt.priceAdjustment ?? "0",
											quantity: opt.quantity ?? null,
											lowStockThreshold: opt.lowStockThreshold ?? null,
											isDefault: opt.isDefault ?? false,
											isActive: opt.isActive ?? true,
											sortOrder: opt.sortOrder ?? 0,
										})),
									}
								: undefined
						}
						isSubmitting={createMutation.isPending || updateMutation.isPending}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<AlertDialog
				open={deletingGroupId !== null}
				onOpenChange={(open) => !open && setDeletingGroupId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción eliminará el grupo y todas sus opciones. Esta acción
							no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
