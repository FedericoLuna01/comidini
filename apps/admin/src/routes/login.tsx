import z from "zod";
import { authClient } from '@repo/auth/client'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import { toast } from '@repo/ui/components/sonner'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) return

    throw redirect({
      to: '/',
    })

  },
  component: LoginPage,
})

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

function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard'
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
    <div className='min-h-screen flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link
                to="/register"
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
