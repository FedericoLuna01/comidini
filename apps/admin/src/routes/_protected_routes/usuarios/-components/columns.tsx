import { type ColumnDef } from "@tanstack/react-table"
import { type UserWithRole } from "@repo/auth/client"
import { RowActionsDropdown } from "./row-actions-dropdown"

export const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    // TODO: Cambiar el cell para mostrar un badge
  },
  {
    id: "actions",
    cell: ({ row }) => {

      return (
        <RowActionsDropdown />
      )
    }
  }
]