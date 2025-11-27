import type { SelectProductWithCategory } from "@repo/db/src/types/product";
import type { ColumnDef } from "@tanstack/react-table";
import { RowActionsDropdown } from "./row-actions-dropdown";

export const columns: ColumnDef<SelectProductWithCategory>[] = [
	{
		id: "product.name",
		accessorKey: "product.name",
		header: "Nombre",
	},
	{
		id: "product.description",
		accessorKey: "product.description",
		header: "Descripción",
	},
	{
		id: "product.price",
		accessorKey: "product.price",
		header: "Precio",
	},
	{
		id: "product.sku",
		accessorKey: "product.sku",
		header: "SKU",
	},
	{
		id: "product.quantity",
		accessorKey: "product.quantity",
		header: "Cantidad",
	},
	{
		id: "product_category.name",
		accessorKey: "product_category.name",
		header: "Categoría",
	},
	{
		id: "product.isActive",
		accessorKey: "product.isActive",
		header: "Activo",
		cell: ({ row }) => (row.original.product.isActive ? "Sí" : "No"),
	},
	{
		id: "product.isFeatured",
		accessorKey: "product.isFeatured",
		header: "Destacado",
		cell: ({ row }) => (row.original.product.isFeatured ? "Sí" : "No"),
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return <RowActionsDropdown product={row.original} />;
		},
	},
];
