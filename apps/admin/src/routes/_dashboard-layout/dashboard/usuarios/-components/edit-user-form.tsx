import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, editUserSchema } from "../../../../../api/users";
import { UserWithRole } from "@repo/auth/client";
import { useNavigate } from "@tanstack/react-router";
import { UserRoleSelect } from "./user-role-select";

// Esquema específico para el formulario con validaciones adicionales
export const editUserFormSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "El nombre debe tener al menos 2 caracteres",
      })
      .max(50, {
        message: "El nombre no puede tener más de 50 caracteres",
      })
      .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, {
        message: "El nombre solo puede contener letras y espacios",
      })
      .trim()
      .refine((val) => val.split(" ").filter((word) => word.length > 0).length >= 2, {
        message: "Debe incluir al menos nombre y apellido separados por espacios",
      })
      .refine((val) => val.split(" ").every((word) => word.length >= 2), {
        message: "Cada parte del nombre debe tener al menos 2 caracteres",
      }),
    email: z
      .string()
      .email({
        message: "No es un correo electrónico válido",
      })
      .min(5, {
        message: "El email debe tener al menos 5 caracteres",
      })
      .max(100, {
        message: "El email no puede tener más de 100 caracteres",
      })
      .toLowerCase()
      .trim()
      .refine((val) => !val.includes(" "), {
        message: "El email no puede contener espacios",
      })
      .refine(
        (val) => {
          // Validar que el email tenga un formato más estricto
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(val);
        },
        {
          message: "El formato del email no es válido",
        },
      ),
    role: z.enum(["user", "admin", "shop"], {
      message: "Debe seleccionar un rol válido",
    }),
  })
  .refine(
    (data) => {
      // Validar que el email no contenga el nombre del usuario
      const nameParts = data.name.toLowerCase().split(" ");
      const emailLocal = data.email.split("@")[0].toLowerCase();

      // Verificar que el email no sea demasiado similar al nombre
      const isSimilar = nameParts.some((part) => part.length > 3 && emailLocal.includes(part.slice(0, -1)));

      return !isSimilar || emailLocal.length > 10; // Permitir si el email es suficientemente largo
    },
    {
      message: "El email parece estar relacionado con el nombre. Asegúrate de que sea correcto.",
      path: ["email"],
    },
  );

interface EditUserFormProps {
  user: UserWithRole | undefined;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!user) return null;

  const form = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin" | "shop",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: z.infer<typeof editUserFormSchema>) => updateUser(user.id, userData),
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      queryClient.invalidateQueries({ queryKey: ["get-user", user.id] });
      navigate({ to: "/dashboard/usuarios" });
    },
    onError: (error) => {
      toast.error("Error al actualizar el usuario");
      console.error("Error updating user:", error);
    },
  });

  const onSubmit = (values: z.infer<typeof editUserFormSchema>) => {
    updateUserMutation.mutate(values);
  };

  const handleCancel = () => {
    navigate({ to: "/dashboard/usuarios" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Juan Carlos Pérez"
                  {...field}
                  onBlur={(e) => {
                    // Limpiar espacios extra y capitalizar cada palabra
                    const cleaned = e.target.value
                      .trim()
                      .split(" ")
                      .filter((word) => word.length > 0)
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(" ");
                    field.onChange(cleaned);
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormDescription>Ingresa el nombre completo del usuario (mínimo nombre y apellido).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  placeholder="ejemplo@gmail.com"
                  type="email"
                  {...field}
                  onBlur={(e) => {
                    // Normalizar el email
                    const normalized = e.target.value.toLowerCase().trim();
                    field.onChange(normalized);
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormDescription>
                Email válido para el inicio de sesión. Debe ser de un dominio reconocido.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol del Usuario</FormLabel>
              <UserRoleSelect
                onChange={field.onChange}
                value={field.value}
                disabled={updateUserMutation.isPending}
              />
              <FormDescription>
                El rol determina los permisos y acceso del usuario en la plataforma.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={updateUserMutation.isPending} className="flex-1">
            {updateUserMutation.isPending ? "Actualizando..." : "Actualizar Usuario"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};
