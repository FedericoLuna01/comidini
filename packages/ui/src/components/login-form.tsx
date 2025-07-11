import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/ui/form'
import { toast } from '@repo/ui/components/ui/sonner'
import { authClient } from "@repo/auth/client.js";
import { Link } from "@tanstack/react-router";
import { GoogleIcon } from "./icons/index.js";


const formSchema = z.object({
  email: z.string().email({
    message: "No es un correo electrónico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }).max(100, {
    message: "La contraseña no puede tener más de 100 caracteres"
  })
})

export const LoginForm = ({ callbackURL }: { callbackURL: string }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:5174/",
    })
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    await authClient.signIn.email({
      email,
      password,
      callbackURL
    }, {
      onSuccess(context) {
        console.log("Login successful:", context)
      },
      onError(context) {
        if (context.error.code === "INVALID_EMAIL_OR_PASSWORD") {
          form.setError("email", {
            type: "manual",
            message: "Correo electrónico o contraseña incorrectos.",
          });
          return;
        }

        toast.error("Inicio de sesión fallido. Por favor, inténtalo de nuevo.");

      }
    });
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>
          Iniciar sesión en tu cuenta
        </CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link
              to="/registrarse"
            >
              Registrarse
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full "
              onClick={handleLoginWithGoogle}
            >
              <GoogleIcon />
              Ingresar con Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
