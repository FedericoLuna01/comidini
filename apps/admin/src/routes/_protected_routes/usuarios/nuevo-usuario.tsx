import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingTitle, HeadingDescription } from '@repo/ui/components/heading'
import z from "zod";
import { authClient } from '@repo/auth/client'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import { toast } from '@repo/ui/components/sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Separator } from '@repo/ui/components/separator';

export const Route = createFileRoute(
  '/_protected_routes/usuarios/nuevo-usuario',
)({
  component: RouteComponent,
})

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  email: z.string()
    .email({
      message: "No es un correo electrónico válido",
    }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  role: z.enum(['admin', 'user'], {
    message: "El rol debe ser 'admin' o 'user'",
  }),
})

function RouteComponent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newUser = await authClient.admin.createUser({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    if (newUser.error && newUser.error.code === "USER_ALREADY_EXISTS") {
      toast.error("El usuario ya existe");
      return;
    }

    if (newUser.error) {
      toast.error("Error al crear el usuario");
      return;
    }

    toast.success("Usuario creado exitosamente");
    form.reset();

  }

  return (
    <div>
      <Heading>
        <HeadingTitle>Nuevo Usuario</HeadingTitle>
        <HeadingDescription>Crear un nuevo usuario en el sistema</HeadingDescription>
        <Separator />
      </Heading>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Perez" {...field} />
                </FormControl>
                <FormDescription>
                  El nombre del usuario debe tener al menos 2 caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="juan@gmail.com" {...field} />
                </FormControl>
                <FormDescription>
                  El email debe ser único y válido. Se usará para el inicio de sesión.
                </FormDescription>
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol de usuario" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecciona el rol del usuario. Los administradores tienen acceso completo al sistema.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Crear Usuario
          </Button>
        </form>
      </Form>
    </div>
  )
}
