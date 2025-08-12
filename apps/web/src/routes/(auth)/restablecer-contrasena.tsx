import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form";
import { toast } from "@repo/ui/components/ui/sonner";
import { authClient } from "@repo/auth/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/restablecer-contrasena")({
  component: ResetPasswordPage,
  validateSearch: resetPasswordSearchSchema,
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
      })
      .max(100, {
        message: "La contraseña no puede tener más de 100 caracteres",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function ResetPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const search = useSearch({ from: "/(auth)/restablecer-contrasena" });
  const token = search.token;

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast.error("Token de restablecimiento inválido o faltante");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (error) {
        if (error.code === "INVALID_TOKEN") {
          toast.error("El enlace de restablecimiento ha expirado o es inválido");
        } else {
          toast.error("Error al restablecer la contraseña. Inténtalo de nuevo.");
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("Contraseña restablecida correctamente");
    } catch (error) {
      toast.error("Error al restablecer la contraseña. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Enlace inválido</CardTitle>
          <CardDescription>
            El enlace de restablecimiento es inválido o ha expirado. Por favor, solicita un nuevo enlace de
            restablecimiento.
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/iniciar-sesion">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/olvide-contrasena">Solicitar nuevo enlace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>¡Contraseña restablecida!</CardTitle>
          <CardDescription>
            Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>Ingresa tu nueva contraseña para completar el restablecimiento.</CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link to="/iniciar-sesion">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
