import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Separator } from "@repo/ui/components/ui/separator";
import { ArrowLeft, Upload, User, Save } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

export const Route = createFileRoute("/(app)/perfil/editar")({
  component: RouteComponent,
});

// Schema de validación con Zod
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    })
    .max(50, {
      message: "El nombre no puede tener más de 50 caracteres",
    }),
  image: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        // Validar URL o base64
        try {
          new URL(val);
          return true;
        } catch {
          // Verificar si es base64
          return val.startsWith("data:image/");
        }
      },
      {
        message: "Debe ser una URL válida o una imagen",
      },
    ),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

function RouteComponent() {
  const navigate = useNavigate();
  const { data } = authClient.useSession();

  const [imagePreview, setImagePreview] = useState(data?.user.image || "");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: data?.user.name || "",
      image: data?.user.image || "",
    },
  });

  async function onSubmit(values: UpdateUserFormData) {
    setIsLoading(true);

    try {
      await authClient.updateUser({
        name: values.name,
        image: values.image || undefined,
      });

      toast.success("Perfil actualizado correctamente");
      navigate({ to: "/perfil" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    navigate({ to: "/perfil" });
  };

  // Actualizar vista previa cuando cambia la URL de imagen en tiempo real
  const watchImage = form.watch("image");
  useEffect(() => {
    if (watchImage !== undefined) {
      setImagePreview(watchImage);
      setImageError(false); // Reset error state when URL changes
    }
  }, [watchImage]);

  // Manejar errores de carga de imagen
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Manejar subida de archivos locales
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    setIsUploading(true);

    // Convertir a base64 para vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      form.setValue("image", result);
      setImageError(false);
      setIsUploading(false);
      toast.success("Imagen cargada correctamente");
    };

    reader.onerror = () => {
      toast.error("Error al cargar la imagen");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={handleCancel} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información personal</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Modifica tu nombre y foto de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {imagePreview && !imageError ? (
                      <AvatarImage
                        src={imagePreview}
                        alt={form.getValues("name")}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    ) : null}
                    <AvatarFallback className="text-lg">
                      {form
                        .getValues("name")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {imageError && imagePreview && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-center">
                      Error
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>URL de la Imagen</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            {...field}
                            disabled={isLoading || isUploading}
                            onChange={(e) => {
                              field.onChange(e);
                              // Actualizar vista previa inmediatamente
                              setImagePreview(e.target.value);
                              setImageError(false);
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isLoading || isUploading}
                          onClick={handleFileUpload}
                          title="Subir imagen desde tu computadora"
                        >
                          {isUploading ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                        {/* Input de archivo oculto */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <FormDescription>
                        Ingresa la URL de tu imagen de perfil
                        <button
                          type="button"
                          onClick={handleFileUpload}
                          className="text-primary hover:underline font-medium"
                          disabled={isLoading || isUploading}
                        ></button>
                        {imageError && imagePreview && (
                          <span className="text-red-500 block mt-1">⚠️ No se pudo cargar la imagen desde esta URL</span>
                        )}
                        {isUploading && <span className="text-blue-500 block mt-1">📤 Subiendo imagen...</span>}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Name Section */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Este nombre se mostrará en tu perfil público</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Current Info Display */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Información Actual</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span> <span>{data?.user.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registro:</span>{" "}
                    <span>{data?.user.createdAt?.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
