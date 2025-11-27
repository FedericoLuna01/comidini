import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form";
import { toast } from "@repo/ui/components/ui/sonner";
import { authClient } from "@repo/auth/client.js";
import { Link } from "@tanstack/react-router";
import { GoogleIcon } from "./icons/index.js";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.js";
import { AlertCircleIcon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "No es un correo electrónico válido",
  }),
  password: z
    .string()
    .min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    })
    .max(100, {
      message: "La contraseña no puede tener más de 100 caracteres",
    }),
});

export const LoginForm = ({ callbackURL }: { callbackURL: string }) => {
  const [userBanned, setUserBanned] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL,
      },
      {
        onSuccess(context) {
          console.log("Login successful:", context);
        },
        onError(context) {
          if (context.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            form.setError("email", {
              type: "manual",
              message: "Correo electrónico o contraseña incorrectos.",
            });
            return;
          }

          if (context.error.code === "BANNED_USER") {
            setUserBanned(true);
            return;
          }

          toast.error("Inicio de sesión fallido. Por favor, inténtalo de nuevo.");
        },
      },
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar sesión en tu cuenta</CardTitle>
        <CardDescription>Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.</CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link to="/registrarse">Registrarse</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="juan@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Button variant="link" asChild className="p-0 h-auto text-xs">
                      <Link to="/olvide-contrasena">¿Olvidaste tu contraseña?</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right"></div>
            {userBanned && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Cuenta suspendida</AlertTitle>
                <AlertDescription>
                  <p>Tu cuenta ha sido suspendida. Si crees que esto es un error, por favor contacta al soporte.</p>
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
            <Button type="button" variant="outline" className="w-full " onClick={handleLoginWithGoogle}>
              <GoogleIcon />
              Ingresar con Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
