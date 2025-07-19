import React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Switch } from "@repo/ui/components/ui/switch"
import { Badge } from "@repo/ui/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Settings,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Truck,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import { createFileRoute } from '@tanstack/react-router'
import { z } from "zod/v4"
import { createShopSchema, CreateShop } from '@repo/db/src/types/shop'

const businessHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean(),
})

const formSchema = createShopSchema.extend({
  businessHours: z.array(businessHoursSchema)
})

type FormValues = z.infer<typeof formSchema>

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@repo/ui/components/ui/stepper"
import { useMutation, useQuery } from '@tanstack/react-query';
import { createShop } from "../../api/shop"
import { APIProvider, Map, type MapMouseEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useDebounceInput } from "../../hooks/use-debounce-input"
import { AutoCompleteInput } from "../../components/auto-complete-select"

export const Route = createFileRoute('/primeros-pasos/')({
  // TODO: add a loader to check if the user already has a shop
  component: RouteComponent,
})

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const STEPS = [
  { id: 1, title: "Información Básica", description: "Sobre tu negocio", icon: Store },
  { id: 2, title: "Ubicación", description: "Dirección de la tienda", icon: MapPin },
  { id: 3, title: "Configuración", description: "Servicios disponibles", icon: Settings },
  { id: 4, title: "Horarios", description: "Horarios de atención", icon: Clock },
  { id: 5, title: "Resumen", description: "Revisa la información", icon: CheckCircle },
]

const fetchPlaceSuggestions = async (address: string): Promise<google.maps.places.AutocompleteSuggestion[]> => {
  if (!address) return [];
  if (!window.google?.maps?.places) {
    throw new Error('Google Maps Places no está disponible');
  }

  const request: google.maps.places.AutocompleteRequest = {
    input: address,
    language: 'es',
    region: 'AR',
    locationRestriction: new google.maps.LatLngBounds(
      new google.maps.LatLng(-55.0, -73.0), // Suroeste de Argentina
      new google.maps.LatLng(-21.0, -53.0)  // Noreste de Argentina
    )
  };

  try {
    console.log("FETCHING SUGGESTIONS")
    const response = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
    return response.suggestions;
  } catch (error) {
    console.error('Error al buscar sugerencias:', error);
    return [];
  }
};

function RouteComponent() {
  const [currentStep, setCurrentStep] = useState(4)
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const defaultCenter = { lat: -32.9526405, lng: -60.6776039 }; // Centro de Rosario
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Nombre de mi tienda",
      description: "",
      phone: "",
      address: "Urquiza 1234, Rosario, Santa Fe, Argentina",
      latitude: "-33.0168041",
      longitude: "-60.8760917",
      acceptsDelivery: false,
      acceptsPickup: false,
      acceptsReservations: false,
      logo: "",
      banner: "",
      tags: [],
      businessHours: DAYS_OF_WEEK.map((_, index) => ({
        dayOfWeek: index,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false
      }))
    },
  })

  const addressValue = form.watch("address");
  const debouncedAddress = useDebounceInput(addressValue, 650);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['placeSuggestions', debouncedAddress],
    queryFn: () => fetchPlaceSuggestions(debouncedAddress),
    enabled: !!debouncedAddress,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const onMapClick = (event: MapMouseEvent) => {
    // TODO: terminar la lógica para manejar el clic en el mapa
    console.log(event)
  }

  const mutation = useMutation({
    mutationFn: async (data: CreateShop) => {
      await createShop(data)
    }
    // TODO: Agregar un onSuccess para redirigir al usuario a su tienda o dashboard
  })

  const isValidForm = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)
    return isValid
  }

  const nextStep = async () => {
    const isValid = await isValidForm()

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof FormValues)[] => {
    switch (step) {
      case 1:
        return ["name", "description", "phone", "email", "website"]
      case 2:
        return ["address"]
      case 3:
        return [
          "deliveryRadius",
          "minimumOrder",
          "deliveryFee",
          "acceptsDelivery",
          "acceptsPickup",
          "acceptsReservations",
        ]
      case 4:
        return ["businessHours"]
      default:
        return []
    }
  }

  const onSubmit = async (data: CreateShop) => {
    console.log(data)
    mutation.mutate(data)
  }

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center flex-col gap-y-6 py-10">
      <div className=" text-center">
        <h1 className="text-4xl font-bold">
          Primeros pasos para crear tu tienda
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Completa los siguientes pasos para configurar tu tienda en Comidini
        </p>
      </div>
      <div>
        <Stepper
          value={currentStep}
          onValueChange={setCurrentStep}
        >
          {STEPS.map(({ id, title, description }) => (
            <StepperItem
              key={id}
              step={id}
              className="relative flex-1 flex-col!"
            >
              <StepperTrigger
                className="flex-col gap-3 rounded"
                onClick={async () => {
                  const isValid = await isValidForm()
                  if (!isValid) return
                  setCurrentStep(id)
                }}
              >
                <StepperIndicator />
                <div className="space-y-0.5 px-2">
                  <StepperTitle>{title}</StepperTitle>
                  <StepperDescription className="max-sm:hidden">
                    {description}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              {id < STEPS.length && (
                <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
              )}
            </StepperItem>
          ))}
        </Stepper>
      </div>
      <Form {...form}>
        <form
          className="min-w-xl h-auto transition-all duration-300 ease-in-out"
          onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Información general de tu negocio"}
                {currentStep === 2 && "¿Dónde se encuentra tu tienda?"}
                {currentStep === 3 && "Configura los servicios que ofreces"}
                {currentStep === 4 && "Define tus horarios de atención"}
                {currentStep === 5 && "Revisa y confirma la información"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Información Básica */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          Nombre de la tienda
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mi Tienda Favorita" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu negocio, productos o servicios..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Una breve descripción ayudará a los clientes a conocer tu negocio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+52 55 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="contacto@mitienda.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Sitio web
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.mitienda.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Ubicación */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Dirección *
                        </FormLabel>
                        <FormControl>
                          <AutoCompleteInput
                            isLoading={isLoading}
                            emptyMessage="No hay resultados"
                            suggestions={suggestions}
                            onChange={(value) => field.onChange(value)}
                            onSelect={async (suggestion) => {
                              field.onChange(suggestion.placePrediction?.text.text || "")
                              const place = suggestion.placePrediction?.toPlace();
                              await place?.fetchFields({
                                fields: ["location"]
                              })
                              if (place?.location) {
                                const newPosition = {
                                  lat: place.location.lat(),
                                  lng: place.location.lng()
                                };
                                console.log(newPosition)
                                form.setValue("latitude", newPosition.lat.toString())
                                form.setValue("longitude", newPosition.lng.toString())
                                setMarkerPosition(newPosition);
                                setMapCenter(newPosition);
                              }
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="rounded-lg overflow-hidden">
                    <APIProvider
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                      libraries={['places', 'marker']}
                      language="es"
                    >
                      <Map
                        className="w-full h-64 rounded-lg"
                        mapId="314bbedb82bc2f89918544e5"
                        center={mapCenter}
                        onCameraChanged={(e) => setMapCenter(e.detail.center)}
                        defaultZoom={13}
                        minZoom={13}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        clickableIcons={false}
                        onClick={(e) => onMapClick(e)}
                      >
                        {markerPosition && <AdvancedMarker position={markerPosition} />}
                      </Map>
                    </APIProvider>
                  </div>
                </div>
              )}

              {/* Step 3: Configuración */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Servicios disponibles</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="acceptsDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2 text-base">
                                <Truck className="w-4 h-4" />
                                Servicio a domicilio
                              </FormLabel>
                              <FormDescription>
                                Ofrece entrega de productos en el domicilio del cliente
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acceptsPickup"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2 text-base">
                                <ShoppingBag className="w-4 h-4" />
                                Recolección en tienda
                              </FormLabel>
                              <FormDescription>Los clientes pueden recoger sus pedidos en tu tienda</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acceptsReservations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2 text-base">
                                <Calendar className="w-4 h-4" />
                                Reservaciones
                              </FormLabel>
                              <FormDescription>Permite a los clientes hacer reservaciones</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {form.watch("acceptsDelivery") && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Configuración de entrega</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="deliveryRadius"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Radio de entrega (km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="5"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="minimumOrder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pedido mínimo ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value || "0")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo de entrega ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="30"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value || "0")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Horarios */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Horarios de atención</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Define los horarios en que tu tienda estará disponible para recibir pedidos
                    </p>
                  </div>
                  {/* TODO: Agregar posibilidad de 2 turnos */}
                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-20 text-sm font-medium">{day}</div>

                        <FormField
                          control={form.control}
                          name={`businessHours.${index}.isClosed`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={!field.value}
                                  onCheckedChange={(checked) => field.onChange(!checked)}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">{field.value ? "Cerrado" : "Abierto"}</FormLabel>
                            </FormItem>
                          )}
                        />

                        {!form.watch(`businessHours.${index}.isClosed`) && (
                          <>
                            <FormField
                              control={form.control}
                              name={`businessHours.${index}.openTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" className="w-32" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <span className="text-sm text-gray-500">a</span>

                            <FormField
                              control={form.control}
                              name={`businessHours.${index}.closeTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" className="w-32" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Resumen */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Resumen de configuración</h3>
                    <p className="text-sm text-gray-600 mb-6">Revisa la información antes de crear tu tienda</p>
                  </div>

                  <div className="space-y-4">
                    {/* Información básica */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Información básica
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Nombre:</strong> {form.watch("name")}
                        </p>
                        {form.watch("description") && (
                          <p>
                            <strong>Descripción:</strong> {form.watch("description")}
                          </p>
                        )}
                        {form.watch("phone") && (
                          <p>
                            <strong>Teléfono:</strong> {form.watch("phone")}
                          </p>
                        )}
                        {form.watch("email") && (
                          <p>
                            <strong>Email:</strong> {form.watch("email")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ubicación
                      </h4>
                      <div className="text-sm">
                        <p>{form.watch("address")}</p>
                      </div>
                    </div>

                    {/* Servicios */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Servicios
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("acceptsDelivery") && <Badge variant="secondary">Entrega a domicilio</Badge>}
                        {form.watch("acceptsPickup") && <Badge variant="secondary">Recolección en tienda</Badge>}
                        {form.watch("acceptsReservations") && <Badge variant="secondary">Reservaciones</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  nextStep()
                }}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={mutation.isPending || currentStep !== STEPS.length}
                className="flex items-center gap-2"
              >
                {mutation.isPending ? "Creando..." : "Crear Tienda"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
