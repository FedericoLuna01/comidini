import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Separator } from "@repo/ui/components/ui/separator";
import { MapPin, Store, Phone, Clock, Users, Camera, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

export const Route = createFileRoute("/(app)/registrar-negocio")({
  component: RouteComponent,
});

// Schema de validación
const businessSchema = z.object({
  businessName: z
    .string()
    .min(2, "El nombre del negocio debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  businessType: z.string().min(1, "Selecciona el tipo de negocio"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  phone: z
    .string()
    .min(8, "El número de teléfono debe tener al menos 8 dígitos")
    .regex(/^[\d\s\-\+\(\)]+$/, "Formato de teléfono inválido"),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  openingHours: z.string().min(3, "Los horarios de atención son requeridos"),
  capacity: z.string().min(1, "La capacidad es requerida"),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  instagram: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      return val.startsWith("@") || val.includes("instagram.com/");
    }, "Debe ser un usuario de Instagram válido (@usuario) o URL"),
  image: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "Debes aceptar los términos y condiciones"),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const businessTypes = [
  { value: "restaurant", label: "Restaurante" },
  { value: "cafe", label: "Café/Cafetería" },
  { value: "bar", label: "Bar/Pub" },
  { value: "bakery", label: "Panadería" },
  { value: "ice-cream", label: "Heladería" },
  { value: "food-truck", label: "Food Truck" },
  { value: "pizzeria", label: "Pizzería" },
  { value: "fast-food", label: "Comida Rápida" },
  { value: "other", label: "Otro" },
];

const capacityOptions = [
  { value: "1-20", label: "1-20 personas" },
  { value: "21-50", label: "21-50 personas" },
  { value: "51-100", label: "51-100 personas" },
  { value: "101-200", label: "101-200 personas" },
  { value: "200+", label: "Más de 200 personas" },
];

function RouteComponent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      description: "",
      phone: "",
      address: "",
      openingHours: "",
      capacity: "",
      website: "",
      instagram: "",
      image: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: BusinessFormData) {
    setIsLoading(true);

    try {
      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del negocio:", values);

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("¡Solicitud enviada correctamente! Te contactaremos pronto.");
      navigate({ to: "/tiendas" });
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    navigate({ to: "/tiendas" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
    form.setValue("image", url);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={handleCancel} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-primary mb-2">¿Querés aparecer en el mapa?</h1>
          <p className="text-lg text-muted-foreground">
            Registrá tu negocio y formá parte de nuestra comunidad gastronómica
          </p>
        </div>
      </div>

      {/* Benefits Banner */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Más Clientes</h3>
              <p className="text-sm text-muted-foreground">Llegá a nuevos comensales</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Mayor Visibilidad</h3>
              <p className="text-sm text-muted-foreground">Aparecé en búsquedas locales</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Gratis</h3>
              <p className="text-sm text-muted-foreground">Sin costo de registro</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6" />
            Información del Negocio
          </CardTitle>
          <CardDescription>Completá todos los campos para que podamos revisar tu solicitud</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Información Básica */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Información Básica
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Negocio *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Pizzería Don Mario" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Negocio *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Negocio *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describí tu negocio, especialidades, ambiente, etc."
                          className="min-h-24"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Contanos qué hace especial a tu negocio (máximo 500 caracteres)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Información de Contacto */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contacto y Ubicación
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: +54 11 1234-5678" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la capacidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {capacityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. Corrientes 1234, CABA" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>Dirección completa para que los clientes puedan encontrarte</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horarios de Atención *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Lun-Dom 12:00-24:00" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>Especificá días y horarios de funcionamiento</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Información Adicional */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Información Adicional
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tu-sitio-web.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="@tu_negocio" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen del Negocio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="URL de una foto de tu negocio"
                          {...field}
                          disabled={isLoading}
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormDescription>Una imagen representativa de tu negocio (opcional)</FormDescription>
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Vista previa"
                            className="w-32 h-32 object-cover rounded-lg border"
                            onError={() => setImagePreview("")}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Términos y Condiciones */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Acepto los términos y condiciones *</FormLabel>
                      <FormDescription>
                        Al registrar mi negocio, acepto que la información proporcionada sea verificada y utilizada para
                        mostrar mi establecimiento en el mapa.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1" size="lg">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} size="lg">
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 text-center">
            <strong>Nota:</strong> Tu solicitud será revisada por nuestro equipo. Te contactaremos dentro de 48-72 horas
            para confirmar la información y activar tu perfil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
