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
        <Badge
          className={cn("", {
            "bg-blue-500 text-white": role === "admin",
            "bg-gray-400 text-white": role === "user",
          })}
        >
          {role === "admin" ? "Administrador" : "Usuario"}
        </Badge>
      );
    },
  },
  //    className={cn("fixed bottom-4 right-4 z-50 duration-300", {
  //   "animate-in fade-in slide-in-from-bottom": role === admin,
  //   "animate-out fade-out slide-out-to-bottom": role === user,
  // })}
  {
    id: "actions",
    cell: ({ row }) => {
      return <RowActionsDropdown />;
    },
  },
];
