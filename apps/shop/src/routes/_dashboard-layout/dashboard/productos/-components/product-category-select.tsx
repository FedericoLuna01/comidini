import type {
	CreateProductCategorySchema,
	SelectProductCategory,
} from "@repo/db/src/types/product";
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
import { Button } from "@repo/ui/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@repo/ui/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { toast } from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { deleteCategory, updateCategory } from "../../../../../api/categories";

interface ProductCategorySelectProps {
	productCategories: SelectProductCategory[] | undefined;
	value?: number;
	onChange: (value: number) => void;
	disabled?: boolean;
	shopId?: number;
}

export function ProductCategorySelect({
	productCategories,
	value,
	onChange,
	disabled,
	shopId,
}: ProductCategorySelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [selectedCategoryName, setSelectedCategoryName] = useState<string>();
	const [editingCategory, setEditingCategory] =
		useState<SelectProductCategory | null>(null);
	const [editName, setEditName] = useState("");
	const [deletingCategory, setDeletingCategory] =
		useState<SelectProductCategory | null>(null);

	const selectedCategory = productCategories?.find(
		(category) => category.id === value,
	);
	const queryClient = useQueryClient();

	const createCategory = useMutation({
		mutationFn: async (data: CreateProductCategorySchema) => {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/shops/${shopId}/category`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
					credentials: "include",
				},
			);
			if (!response.ok) {
				throw new Error("Error al crear la categoría");
			}
			return response.json();
		},
		onSuccess: (newCategory: {
			message: string;
			category: SelectProductCategory;
		}) => {
			// Actualizar el cache de la query
			queryClient.setQueryData(
				["productCategories", shopId],
				(oldData: SelectProductCategory[] = []) => [
					...oldData,
					newCategory.category,
				],
			);

			// Actualizar el valor seleccionado
			setSelectedCategoryName(newCategory.category.name);
			onChange?.(newCategory.category.id);
			setOpen(false);
			setInputValue("");

			toast.success("Categoría creada exitosamente");
		},
		onError: () => {
			toast.error("Error al crear la categoría");
		},
	});

	const updateCategoryMutation = useMutation({
		mutationFn: async ({
			categoryId,
			name,
		}: {
			categoryId: number;
			name: string;
		}) => {
			if (!shopId) throw new Error("Shop ID is required");
			return updateCategory(shopId, categoryId, { name });
		},
		onSuccess: (response: {
			message: string;
			category: SelectProductCategory;
		}) => {
			queryClient.setQueryData(
				["productCategories", shopId],
				(oldData: SelectProductCategory[] = []) =>
					oldData.map((cat) =>
						cat.id === response.category.id ? response.category : cat,
					),
			);
			setEditingCategory(null);
			setEditName("");
			toast.success("Categoría actualizada exitosamente");
		},
		onError: () => {
			toast.error("Error al actualizar la categoría");
		},
	});

	const deleteCategoryMutation = useMutation({
		mutationFn: async (categoryId: number) => {
			if (!shopId) throw new Error("Shop ID is required");
			return deleteCategory(shopId, categoryId);
		},
		onSuccess: (
			response: {
				message: string;
				category: SelectProductCategory;
				productsAffected: number;
			},
			categoryId,
		) => {
			queryClient.setQueryData(
				["productCategories", shopId],
				(oldData: SelectProductCategory[] = []) =>
					oldData.filter((cat) => cat.id !== categoryId),
			);
			if (value === categoryId) {
				setSelectedCategoryName(undefined);
			}
			setDeletingCategory(null);
			if (response.productsAffected > 0) {
				toast.success(
					`Categoría eliminada. ${response.productsAffected} producto(s) quedaron sin categoría.`,
				);
			} else {
				toast.success("Categoría eliminada exitosamente");
			}
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
		onError: () => {
			toast.error("Error al eliminar la categoría");
		},
	});

	const handleEditClick = (
		e: React.MouseEvent,
		category: SelectProductCategory,
	) => {
		e.stopPropagation();
		e.preventDefault();
		setEditingCategory(category);
		setEditName(category.name);
	};

	const handleDeleteClick = (
		e: React.MouseEvent,
		category: SelectProductCategory,
	) => {
		e.stopPropagation();
		e.preventDefault();
		setDeletingCategory(category);
	};

	const handleEditSubmit = () => {
		if (!editingCategory || !editName.trim()) return;
		updateCategoryMutation.mutate({
			categoryId: editingCategory.id,
			name: editName.trim(),
		});
	};

	const handleDeleteConfirm = () => {
		if (!deletingCategory) return;
		deleteCategoryMutation.mutate(deletingCategory.id);
	};

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<PopoverAnchor asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-full justify-between font-normal"
						>
							{selectedCategory?.name ??
								selectedCategoryName ??
								"Seleccionar categoría..."}
							<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverAnchor>
				</PopoverTrigger>
				<PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
					<Command
						filter={(value, search) => {
							if (value.includes(search)) return 1;
							if (value === "create") return 1;
							return 0;
						}}
					>
						<CommandInput
							placeholder="Buscar o crear categoría..."
							value={inputValue}
							onValueChange={setInputValue}
						/>
						<CommandList>
							<CommandEmpty>
								<p>No se encontraron categorías.</p>
							</CommandEmpty>
							<CommandGroup>
								{productCategories?.map((category) => (
									<CommandItem
										key={category.id}
										value={category.name}
										onSelect={() => {
											onChange?.(category.id);
											setOpen(false);
										}}
										disabled={disabled}
										className="flex items-center justify-between"
									>
										<div className="flex items-center">
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													value === category.id ? "opacity-100" : "opacity-0",
												)}
											/>
											{category.name}
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger
												asChild
												onClick={(e) => e.stopPropagation()}
											>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreHorizontalIcon className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(e) => handleEditClick(e, category)}
												>
													<PencilIcon className="mr-2 h-4 w-4" />
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => handleDeleteClick(e, category)}
													className="text-destructive focus:text-destructive"
												>
													<TrashIcon className="mr-2 h-4 w-4" />
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</CommandItem>
								))}
							</CommandGroup>
							{productCategories && inputValue.trim() && (
								<CommandGroup
									heading="Crear nueva categoría"
									className="border-t"
								>
									<CommandItem
										value="create"
										onSelect={() => {
											if (!inputValue.trim()) return;
											createCategory.mutate({
												name: inputValue,
												isActive: true,
												sortOrder: 0,
											});
										}}
									>
										<PlusIcon className="mr-2 h-4 w-4" />
										Crear "{inputValue}"
									</CommandItem>
								</CommandGroup>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{/* Edit Category Dialog */}
			<Dialog
				open={!!editingCategory}
				onOpenChange={(open) => !open && setEditingCategory(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar categoría</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="category-name">Nombre</Label>
							<Input
								id="category-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder="Nombre de la categoría"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingCategory(null)}>
							Cancelar
						</Button>
						<Button
							onClick={handleEditSubmit}
							disabled={!editName.trim() || updateCategoryMutation.isPending}
						>
							{updateCategoryMutation.isPending ? "Guardando..." : "Guardar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Category Confirmation Dialog */}
			<AlertDialog
				open={!!deletingCategory}
				onOpenChange={(open) => !open && setDeletingCategory(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Los productos en esta categoría
							quedarán sin categoría asignada.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteCategoryMutation.isPending ? "Eliminando..." : "Eliminar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
