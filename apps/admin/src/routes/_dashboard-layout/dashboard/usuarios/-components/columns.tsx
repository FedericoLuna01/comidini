import { type ColumnDef } from "@tanstack/react-table";
import { type Session } from "@repo/auth/client";
import { RowActionsDropdown } from "./row-actions-dropdown";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { displayRole } from "./new-user-form";
import { type UserWithRole } from "@repo/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { BadgeCheckIcon, BadgeXIcon } from "lucide-react";

export const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "name",
    header: "Usuario",
    cell: ({ row }) => {
      const { name } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={row.original.image || ""}
              alt={`${name}'s avatar`}
            />
            <AvatarFallback>
              {name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const { role } = row.original;

      return (
        <Badge
          className={cn("", {
            "bg-blue-500 text-white": role === "admin",
            "bg-gray-400 text-white": role === "user",
          })}
        >
          {role && displayRole[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: () => (
      <div className="flex items-center justify-center">
        Estado
      </div>
    ),
    cell: ({ row }) => {
      const { banned } = row.original;

      return (
        <div className="flex items-center justify-center">
          {
            banned ? (
              <BadgeXIcon className="text-red-600" />
            ) : (
              <BadgeCheckIcon className="text-green-600" />
            )
          }
        </div>
      )

    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <RowActionsDropdown />;
    },
  },
];
