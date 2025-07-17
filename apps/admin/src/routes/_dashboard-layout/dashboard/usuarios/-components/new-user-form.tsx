import z from "zod";
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/ui/form'
import { toast } from '@repo/ui/components/ui/sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Spinner } from '@repo/ui/components/ui/spinner';
import { userRoleEnum } from '@repo/db/src/schema/auth-schema';
import { useMutation } from '@tanstack/react-query';
import { createUser } from '../../../../../api/users';
import { UserRoleSelect } from "./user-role-select";

export const createUserSchema = z.object({
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
  role: z.enum(userRoleEnum.enumValues, {
    message: "El rol debe ser admin o user",
  }),
})

export function NewUserForm() {
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const mutation = useMutation({
    mutationFn: async (user: z.infer<typeof createUserSchema>) => await createUser(user),
  })

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    mutation.mutate(values)

    if (mutation.data?.error && mutation.data.error.code === "USER_ALREADY_EXISTS") {
      form.setError("email", {
        type: "manual",
        message: "El email ya está en uso. Por favor, utiliza otro email.",
      });
      return;
    }

    if (mutation.data?.error || mutation.isError) {
      return toast.error("Error al crear el usuario");
    }

    mutation.isSuccess && toast.success("Usuario creado exitosamente");

    form.reset();
  }

  return (
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
                <Input placeholder="Juan Perez" {...field} disabled={mutation.isPending} />
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
                <Input placeholder="juan@gmail.com" {...field} disabled={mutation.isPending} />
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
                <Input type="password" placeholder="********" {...field} disabled={mutation.isPending} />
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
              <UserRoleSelect
                onChange={field.onChange}
                value={field.value}
                disabled={mutation.isPending}
              />
              <FormDescription>
                Selecciona el rol del usuario. Los administradores tienen acceso completo al sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Spinner />
              Creando usuario...
            </>
          ) : (
            "Crear Usuario"
          )}
        </Button>
      </form>
    </Form>
  )
}
