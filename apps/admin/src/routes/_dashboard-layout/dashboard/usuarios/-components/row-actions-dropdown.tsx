import React, { useState } from "react";
import { MoreHorizontal, Edit2, Ban, Trash2, ShieldCheck, AlertTriangle, User } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/ui/sheet";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@repo/ui/components/ui/alert-dialog";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithRole } from "@repo/auth/client";
import { banUser, unbanUser, deleteUser, setUserRole, getBanDurationInSeconds } from "../../../../../api/users";
import { useNavigate } from "@tanstack/react-router";
import { displayRole } from "./user-role-select";

interface RowActionsDropdownProps {
  user: UserWithRole;
}

export const RowActionsDropdown: React.FC<RowActionsDropdownProps> = ({ user }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBanSheet, setShowBanSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<"1h" | "24h" | "7d" | "30d" | "permanent">("permanent");
  const [editRole, setEditRole] = useState<"user" | "admin" | "shop">(user.role as "user" | "admin" | "shop");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const banMutation = useMutation({
    mutationFn: ({ userId, reason, banExpiresIn }: { userId: string; reason?: string; banExpiresIn?: number }) =>
      banUser(userId, reason, banExpiresIn),
    onSuccess: () => {
      toast.success("Usuario suspendido exitosamente");
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      setShowBanSheet(false);
      setBanReason("");
      setBanDuration("permanent");
    },
    onError: () => {
      toast.error("Error al banear el usuario");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      toast.success("Usuario habilitado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
    },
    onError: () => {
      toast.error("Error al desbanear el usuario");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      setShowDeleteConfirm(false);
    },
    onError: () => {
      toast.error("Error al eliminar el usuario");
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" | "shop" }) => setUserRole(userId, role),
    onSuccess: () => {
      toast.success("Rol del usuario actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      setShowEditSheet(false);
    },
    onError: () => {
      toast.error("Error al actualizar el rol del usuario");
    },
  });

  const handleBanUser = () => {
    const banExpiresIn = getBanDurationInSeconds(banDuration);
    banMutation.mutate({ userId: user.id, reason: banReason, banExpiresIn });
  };

  const handleUnbanUser = () => {
    unbanMutation.mutate(user.id);
  };

  const handleEditUser = () => {
    if (editRole !== user.role) {
      setRoleMutation.mutate({ userId: user.id, role: editRole });
    }
  };

  const handleEditProfile = () => {
    navigate({ to: `/dashboard/usuarios/editar-usuario/${user.id}` });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleEditProfile}>
            <User className="mr-2 h-4 w-4" />
            Editar perfil
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowEditSheet(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar rol
          </DropdownMenuItem>

          {user.banned ? (
            <DropdownMenuItem onClick={handleUnbanUser}>
              <ShieldCheck className="mr-2 h-4 w-4 " />
              Habilitar usuario
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowBanSheet(true)}>
              <Ban className="mr-2 h-4 w-4 " />
              Suspender usuario
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
            Eliminar usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sheet para editar rol del usuario */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Rol Del Usuario</SheetTitle>
            <SheetDescription>Cambiar el rol del usuario {user.name}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4">
            <div className="flex flex-col gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select
                value={editRole}
                onValueChange={(value: "user" | "admin" | "shop") =>
                  setEditRole(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{displayRole.user}</SelectItem>
                  <SelectItem value="admin">{displayRole.admin}</SelectItem>
                  <SelectItem value="shop">{displayRole.shop}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowEditSheet(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={setRoleMutation.isPending}>
              {setRoleMutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sheet para banear usuario */}
      <Sheet open={showBanSheet} onOpenChange={setShowBanSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Suspender Usuario</SheetTitle>
            <SheetDescription>¿Estás seguro de que deseas suspender a {user.name}?</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4">
            <div className="flex flex-col gap-4">
              <Label htmlFor="reason" className="text-right">
                Razón
              </Label>
              <Textarea
                id="reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Razón de la suspension (opcional)"
                className="col-span-3"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="duration" className="text-right">
                Duración
              </Label>
              <Select
                value={banDuration}
                onValueChange={(value: "1h" | "24h" | "7d" | "30d" | "permanent") => setBanDuration(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowBanSheet(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBanUser} disabled={banMutation.isPending} variant="destructive">
              {banMutation.isPending ? "Suspendiendo..." : "Suspender"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás totalmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <b>{`${user.name} (${user.email})`}</b> y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(user.id)}
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
