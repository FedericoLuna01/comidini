import { type ColumnDef } from "@tanstack/react-table";
import { SelectProductWithCategory } from "@repo/db/src/types/product";

export const columns: ColumnDef<SelectProductWithCategory>[] = [
  {
    id: "product.name",
    accessorKey: "product.name",
    header: "Nombre",
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     // return <RowActionsDropdown user={row.original} />;
  //   },
  // },
];
