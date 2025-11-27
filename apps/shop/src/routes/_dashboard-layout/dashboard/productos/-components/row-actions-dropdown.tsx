import type { SelectProductWithCategory } from "@repo/db/src/types/product";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { deleteProductMutationOptions } from "../../../../../api/products";

interface RowActionsDropdownProps {
	product: SelectProductWithCategory;
}

export const RowActionsDropdown: React.FC<RowActionsDropdownProps> = ({
	product,
}) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const deleteMutation = useMutation({
		...deleteProductMutationOptions(product.product.id),
		onSuccess: () => {
			toast.success("Producto eliminado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
			setShowDeleteConfirm(false);
		},
		onError: () => {
			toast.error("Error al eliminar el producto");
		},
	});

	const handleEditProduct = () => {
		navigate({
			to: `/dashboard/productos/editar-producto/${product.product.id}`,
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Abrir menú</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Acciones</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={handleEditProduct}>
						<Edit2 className="mr-2 h-4 w-4" />
						Editar producto
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => setShowDeleteConfirm(true)}
						className="text-red-600 focus:text-red-600"
					>
						<Trash2 className="mr-2 h-4 w-4 text-red-600" />
						Eliminar producto
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog onOpenChange={setShowDeleteConfirm} open={showDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Estás totalmente seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción eliminará el producto <b>{product.product.name}</b> y
							todos sus datos asociados. Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteMutation.mutate()}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
