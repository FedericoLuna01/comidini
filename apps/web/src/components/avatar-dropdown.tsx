import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { authClient } from "@repo/auth/client";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "@repo/ui/components/ui/sonner";
import { LogOut, UserIcon } from "lucide-react";

const AvatarDropdown = () => {
  const navigate = useNavigate();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/iniciar-sesion",
            replace: true,
          });
          toast.success("Sesión cerrada correctamente");
        },
      },
    });
  }

  const session = authClient.useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="text-white cursor-pointer w-10 h-10">
          <AvatarImage src={session.data?.user.image ?? undefined} alt={session.data?.user.name} />
          <AvatarFallback className="bg-primary">{session.data?.user.name?.[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col">
            <span className="font-medium">{session.data?.user.name}</span>
            <span className="text-xs text-muted-foreground">{session.data?.user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center gap-2">
            <UserIcon />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
