import { type ColumnDef } from "@tanstack/react-table";
import { type UserWithRole } from "@repo/auth/client";
import { RowActionsDropdown } from "./row-actions-dropdown";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

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
    //Usuario cambiar de color si se desea, por defecto esta en gris (secondary)
    cell: ({ row }) => {
      const role = row.getValue("role");
      return (
        <Badge variant={role === "admin" ? "destructive" : "secondary"}>
          {role === "admin" ? "Administrador" : "Usuario"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <RowActionsDropdown />;
    },
  },
];
