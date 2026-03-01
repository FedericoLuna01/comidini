import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { type CreateShop, createShopSchema } from "@repo/db/src/types/shop";
import {
	type MapLocation,
	MapWithAutocomplete,
} from "@repo/ui/components/map-with-autocomplete";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@repo/ui/components/ui/stepper";
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	CreditCard,
	DollarSign,
	Globe,
	Mail,
	MapPin,
	Phone,
	Plus,
	Settings,
	ShoppingBag,
	Store,
	Trash2,
	Truck,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { createShop, getShopStatus } from "../../api/shops";
import { TagSelector } from "../../components/tag-selector";

const timeSlotSchema = z.object({
	openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const businessHoursSchema = z.object({
	dayOfWeek: z.number().min(0).max(6),
	isClosed: z.boolean(),
	timeSlots: z.array(timeSlotSchema),
});

// Esquema de validación con mensajes personalizados
const formSchema = createShopSchema
	.extend({
		// Validaciones más estrictas para el formulario
		name: z
			.string()
			.min(3, { message: "El nombre debe tener al menos 3 caracteres" })
			.max(100, { message: "El nombre no puede exceder los 100 caracteres" })
			.regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-'.]+$/, {
				message:
					"El nombre solo puede contener letras, números, espacios y guiones",
			}),
		// Descripción OBLIGATORIA
		description: z
			.string()
			.min(10, { message: "La descripción debe tener al menos 10 caracteres" })
			.max(500, {
				message: "La descripción no puede exceder los 500 caracteres",
			}),
		// Teléfono OBLIGATORIO - mensajes cortos para móvil
		phone: z
			.string()
			.min(1, { message: "Requerido" })
			.min(8, { message: "Mín. 8 dígitos" })
			.max(20, { message: "Máx. 20 dígitos" }),
		// Email OBLIGATORIO
		email: z
			.email({ message: "Ingresa un email válido (ej: ejemplo@correo.com)" })
			.min(1, { message: "El email es obligatorio" }),
		// Website OPCIONAL
		website: z
			.url({ message: "Ingresa una URL válida (ej: https://www.ejemplo.com)" })
			.optional()
			.or(z.literal("")),
		// Validación de ubicación
		address: z
			.string()
			.min(5, { message: "La dirección debe tener al menos 5 caracteres" })
			.max(200, {
				message: "La dirección no puede exceder los 200 caracteres",
			}),
		latitude: z
			.string()
			.min(1, { message: "Debes seleccionar una ubicación en el mapa" }),
		longitude: z
			.string()
			.min(1, { message: "Debes seleccionar una ubicación en el mapa" }),
		businessHours: z.array(businessHoursSchema),
		// Pagos
		acceptsCash: z.boolean().optional(),
		cashDiscountPercentage: z.string().optional(),
	})
	.refine(
		(data) => {
			// Validar que las coordenadas sean válidas si están presentes
			if (data.latitude && data.longitude) {
				const lat = Number.parseFloat(data.latitude);
				const lng = Number.parseFloat(data.longitude);
				return (
					!Number.isNaN(lat) &&
					!Number.isNaN(lng) &&
					lat >= -90 &&
					lat <= 90 &&
					lng >= -180 &&
					lng <= 180
				);
			}
			return false;
		},
		{
			message: "Selecciona una ubicación válida en el mapa",
			path: ["address"],
		},
	)
	.refine(
		(data) => {
			// Validar que al menos un día tenga horario activo
			const hasAtLeastOneOpenDay = data.businessHours.some(
				(day) => !day.isClosed && day.timeSlots.length > 0,
			);
			return hasAtLeastOneOpenDay;
		},
		{
			message: "Debes tener al menos un día con horario de atención",
			path: ["businessHours"],
		},
	);

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/primeros-pasos/")({
	beforeLoad: async () => {
		// Verificar si el usuario está autenticado
		const session = await authClient.getSession();

		if (!session.data) {
			throw redirect({
				to: "/iniciar-sesion",
			});
		}

		if (session.data.user.role !== "shop") {
			throw redirect({
				to: "/",
			});
		}

		// Verificar si el usuario ya tiene una tienda
		try {
			const status = await getShopStatus();
			if (status.hasShop) {
				throw redirect({
					to: "/dashboard",
				});
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes("redirect")) {
				throw error;
			}
			console.error("Error checking shop status:", error);
		}
	},
	component: RouteComponent,
});

const DAYS_OF_WEEK = [
	"Domingo",
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
];

// Lista de países con prefijos telefónicos (usando SVG de flagcdn.com)
const COUNTRY_CODES = [
	{ code: "ar", name: "Argentina", prefix: "+54" },
	{ code: "mx", name: "México", prefix: "+52" },
	{ code: "es", name: "España", prefix: "+34" },
	{ code: "us", name: "Estados Unidos", prefix: "+1" },
	{ code: "co", name: "Colombia", prefix: "+57" },
	{ code: "cl", name: "Chile", prefix: "+56" },
	{ code: "pe", name: "Perú", prefix: "+51" },
	{ code: "uy", name: "Uruguay", prefix: "+598" },
	{ code: "py", name: "Paraguay", prefix: "+595" },
	{ code: "bo", name: "Bolivia", prefix: "+591" },
	{ code: "ec", name: "Ecuador", prefix: "+593" },
	{ code: "ve", name: "Venezuela", prefix: "+58" },
	{ code: "br", name: "Brasil", prefix: "+55" },
];

// Función para obtener la URL del SVG de la bandera
const getFlagUrl = (countryCode: string) =>
	`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

const STEPS = [
	{
		id: 1,
		title: "Información Básica",
		description: "Sobre tu negocio",
		icon: Store,
	},
	{
		id: 2,
		title: "Ubicación",
		description: "Dirección de la tienda",
		icon: MapPin,
	},
	{
		id: 3,
		title: "Configuración",
		description: "Servicios disponibles",
		icon: Settings,
	},
	{
		id: 4,
		title: "Horarios",
		description: "Horarios de atención",
		icon: Clock,
	},
	{
		id: 5,
		title: "Resumen",
		description: "Revisa la información",
		icon: CheckCircle,
	},
];

function RouteComponent() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Argentina por defecto

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: "onChange", // Validar en tiempo real
		defaultValues: {
			name: "",
			description: "",
			phone: "",
			email: "",
			website: "",
			address: "",
			latitude: "", // Vacío para forzar selección en mapa
			longitude: "", // Vacío para forzar selección en mapa
			acceptsDelivery: false,
			acceptsPickup: false,
			acceptsReservations: false,
			logo: "",
			banner: "",
			tags: [],
			acceptsCash: true,
			cashDiscountPercentage: "0",
			businessHours: DAYS_OF_WEEK.map((_, index) => ({
				dayOfWeek: index,
				isClosed: index === 0, // Domingo cerrado por defecto
				timeSlots: [{ openTime: "09:00", closeTime: "18:00" }],
			})),
		},
	});

	// Función para convertir los horarios del formulario al formato del API
	const convertBusinessHoursForApi = (
		hours: FormValues["businessHours"],
	): Array<{
		dayOfWeek: number;
		openTime: string;
		closeTime: string;
		isClosed: boolean;
	}> => {
		const result: Array<{
			dayOfWeek: number;
			openTime: string;
			closeTime: string;
			isClosed: boolean;
		}> = [];

		for (const day of hours) {
			if (day.isClosed) {
				result.push({
					dayOfWeek: day.dayOfWeek,
					openTime: "00:00",
					closeTime: "00:00",
					isClosed: true,
				});
			} else {
				for (const slot of day.timeSlots) {
					result.push({
						dayOfWeek: day.dayOfWeek,
						openTime: slot.openTime,
						closeTime: slot.closeTime,
						isClosed: false,
					});
				}
			}
		}

		return result;
	};

	const mutation = useMutation({
		mutationFn: async (data: CreateShop) => {
			return await createShop(data);
		},
		onSuccess: () => {
			// Redirigir al usuario al dashboard
			navigate({ to: "/dashboard" });
		},
		onError: (error: Error) => {
			console.error("Error al crear tienda:", error);
			alert(`Error: ${error.message}`);
		},
	});

	const isValidForm = async () => {
		const fieldsToValidate = getFieldsForStep(currentStep);
		const isValid = await form.trigger(fieldsToValidate);
		return isValid;
	};

	const nextStep = async () => {
		const isValid = await isValidForm();

		if (isValid && currentStep < STEPS.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const getFieldsForStep = (step: number): (keyof FormValues)[] => {
		switch (step) {
			case 1:
				return ["name", "description", "phone", "email", "website"];
			case 2:
				return ["address", "latitude", "longitude"];
			case 3:
				return [
					"deliveryRadius",
					"minimumOrder",
					"deliveryFee",
					"acceptsDelivery",
					"acceptsPickup",
					"acceptsReservations",
					"acceptsCash",
					"cashDiscountPercentage",
				];
			case 4:
				return ["businessHours"];
			default:
				return [];
		}
	};

	const onSubmit = async (data: FormValues) => {
		// Limpiar datos: remover strings vacíos que causarían error de validación
		// y asegurar tipos correctos
		const cleanedData: CreateShop & {
			businessHours: ReturnType<typeof convertBusinessHoursForApi>;
		} = {
			name: data.name,
			address: data.address,
			acceptsDelivery: data.acceptsDelivery,
			acceptsPickup: data.acceptsPickup,
			acceptsReservations: data.acceptsReservations,
			// Campos opcionales - solo incluir si tienen valor
			...(data.email?.trim() && { email: data.email.trim() }),
			...(data.website?.trim() && { website: data.website.trim() }),
			...(data.phone?.trim() && {
				phone: `${selectedCountry.prefix} ${data.phone.trim()}`,
			}),
			...(data.description?.trim() && { description: data.description.trim() }),
			...(data.latitude && { latitude: data.latitude }),
			...(data.longitude && { longitude: data.longitude }),
			...(data.logo && { logo: data.logo }),
			...(data.banner && { banner: data.banner }),
			...(data.tags && data.tags.length > 0 && { tags: data.tags }),
			// Pagos
			acceptsCash: data.acceptsCash,
			...(data.cashDiscountPercentage && {
				cashDiscountPercentage: data.cashDiscountPercentage,
			}),
			// Campos de delivery - asegurar que sean strings
			...(data.deliveryRadius !== undefined && {
				deliveryRadius: data.deliveryRadius,
			}),
			...(data.minimumOrder && { minimumOrder: String(data.minimumOrder) }),
			...(data.deliveryFee && { deliveryFee: String(data.deliveryFee) }),
			// Horarios convertidos al formato del API
			businessHours: convertBusinessHoursForApi(data.businessHours),
		};

		mutation.mutate(cleanedData as CreateShop);
	};

	const addTimeSlot = (dayIndex: number) => {
		const currentHours = form.getValues(`businessHours.${dayIndex}`);
		form.setValue(`businessHours.${dayIndex}.timeSlots`, [
			...currentHours.timeSlots,
			{ openTime: "14:00", closeTime: "22:00" },
		]);
	};

	const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
		const currentHours = form.getValues(`businessHours.${dayIndex}`);
		if (currentHours.timeSlots.length > 1) {
			form.setValue(
				`businessHours.${dayIndex}.timeSlots`,
				currentHours.timeSlots.filter((_, i) => i !== slotIndex),
			);
		}
	};

	return (
		<div className="container mx-auto min-h-screen flex items-center justify-center flex-col gap-y-4 sm:gap-y-6 py-6 sm:py-10 px-4 sm:px-6">
			<div className="text-center">
				<h1 className="text-2xl sm:text-4xl font-bold">
					Primeros pasos para crear tu tienda
				</h1>
				<p className="text-xs sm:text-sm text-gray-500 mt-1">
					Completa los siguientes pasos para configurar tu tienda en Comidini
				</p>
			</div>
			<div className="w-full overflow-x-auto px-2 sm:px-0">
				<Stepper value={currentStep} onValueChange={setCurrentStep}>
					{STEPS.map(({ id, title, description }) => (
						<StepperItem
							key={id}
							step={id}
							className="relative flex-1 flex-col!"
						>
							<StepperTrigger
								className="flex-col gap-2 sm:gap-3 rounded"
								onClick={async () => {
									const isValid = await isValidForm();
									if (!isValid) return;
									setCurrentStep(id);
								}}
							>
								<StepperIndicator />
								<div className="space-y-0.5 px-1 sm:px-2">
									<StepperTitle className="text-xs sm:text-sm">
										{title}
									</StepperTitle>
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
					className="w-full max-w-xl h-auto transition-all duration-300 ease-in-out"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{React.createElement(STEPS[currentStep - 1].icon, {
									className: "w-5 h-5",
								})}
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
													Nombre de la tienda *
												</FormLabel>
												<FormControl>
													<Input placeholder="Mi Tienda Favorita" {...field} />
												</FormControl>
												<div className="min-h-[20px]">
													<FormMessage />
												</div>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Descripción *</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Describe tu negocio, productos o servicios..."
														className="min-h-[100px]"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Una breve descripción ayudará a los clientes a conocer
													tu negocio (mínimo 10 caracteres)
												</FormDescription>
												<div className="min-h-[20px]">
													<FormMessage />
												</div>
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
														Teléfono *
													</FormLabel>
													<FormControl>
														<div className="flex w-full items-stretch">
															{/* Select con bandera */}
															<Select
																value={selectedCountry.code}
																onValueChange={(val) =>
																	setSelectedCountry(
																		COUNTRY_CODES.find((c) => c.code === val) ??
																			COUNTRY_CODES[0],
																	)
																}
															>
																<SelectTrigger className="w-14 sm:w-16 px-2 rounded-r-none border-r-0 shrink-0">
																	<SelectValue>
																		<span className="flex items-center justify-center">
																			<img
																				src={getFlagUrl(selectedCountry.code)}
																				alt={selectedCountry.name}
																				className="w-5 sm:w-6 h-auto rounded-sm"
																			/>
																		</span>
																	</SelectValue>
																</SelectTrigger>
																<SelectContent>
																	{COUNTRY_CODES.map((c) => (
																		<SelectItem key={c.code} value={c.code}>
																			<span className="flex items-center gap-2">
																				<img
																					src={getFlagUrl(c.code)}
																					alt={c.name}
																					className="w-5 h-auto rounded-sm"
																				/>
																				{c.name} ({c.prefix})
																			</span>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>

															{/* Input con prefijo de país */}
															<div className="relative flex-1 min-w-0">
																<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none whitespace-nowrap">
																	{selectedCountry.prefix}
																</span>
																<Input
																	{...field}
																	inputMode="tel"
																	pattern="[0-9\s\-()]+"
																	maxLength={20}
																	className="rounded-l-none"
																	style={{
																		paddingLeft: `${Math.max(selectedCountry.prefix.length * 0.55 + 1.2, 2.5)}rem`,
																	}}
																	placeholder="9 1234 5678"
																	onInput={(
																		e: React.FormEvent<HTMLInputElement>,
																	) => {
																		const target = e.target as HTMLInputElement;
																		target.value = target.value.replace(
																			/[^\d\s\-()]/g,
																			"",
																		);
																		field.onChange(target.value);
																	}}
																/>
															</div>
														</div>
													</FormControl>
													<div className="min-h-[20px]">
														<FormMessage />
													</div>
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
														Email *
													</FormLabel>
													<FormControl>
														<Input
															type="email"
															placeholder="contacto@mitienda.com"
															{...field}
														/>
													</FormControl>
													<div className="min-h-[20px]">
														<FormMessage />
													</div>
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
													Sitio web (opcional)
												</FormLabel>
												<FormControl>
													<Input
														placeholder="https://www.mitienda.com"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Si tienes un sitio web, agrégalo aquí
												</FormDescription>
												<div className="min-h-[20px]">
													<FormMessage />
												</div>
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
										render={() => (
											<FormItem>
												<MapWithAutocomplete
													initialAddress={form.getValues("address")}
													initialLat={
														form.getValues("latitude")
															? Number.parseFloat(
																	form.getValues("latitude") ?? "",
																)
															: undefined
													}
													initialLng={
														form.getValues("longitude")
															? Number.parseFloat(
																	form.getValues("longitude") ?? "",
																)
															: undefined
													}
													onLocationChange={(location: MapLocation) => {
														form.setValue("address", location.address, {
															shouldValidate: true,
														});
														form.setValue("latitude", location.lat.toString(), {
															shouldValidate: true,
														});
														form.setValue(
															"longitude",
															location.lng.toString(),
															{
																shouldValidate: true,
															},
														);
														// Limpiar errores al seleccionar ubicación
														form.clearErrors([
															"address",
															"latitude",
															"longitude",
														]);
													}}
													googleMapsApiKey={
														import.meta.env.VITE_GOOGLE_MAPS_API_KEY
													}
													googleMapsMapId="314bbedb82bc2f8947b9d13c"
													addressLabel="Dirección *"
													placeholder="Buscar dirección..."
													mapHeight="16rem"
													locationRestriction={{
														south: -33.04,
														west: -60.74,
														north: -32.9,
														east: -60.6,
													}}
												/>
												<div className="min-h-[20px]">
													<FormMessage />
													{/* Mostrar error si no se ha seleccionado ubicación en el mapa */}
													{(form.formState.errors.latitude ||
														form.formState.errors.longitude) &&
														!form.formState.errors.address && (
															<p className="text-sm font-medium text-destructive">
																Selecciona una ubicación en el mapa haciendo
																clic o buscando una dirección
															</p>
														)}
												</div>
											</FormItem>
										)}
									/>
									{/* Indicador visual de estado de ubicación - altura fija para evitar saltos */}
									<div className="min-h-[48px] sm:min-h-[48px]">
										{form.watch("latitude") &&
											form.watch("longitude") &&
											form.watch("address") &&
											form.formState.dirtyFields.address && (
												<div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 p-2.5 sm:p-3 rounded-lg">
													<CheckCircle className="w-4 h-4 shrink-0" />
													<span>Ubicación seleccionada correctamente</span>
												</div>
											)}
										{(!form.watch("latitude") || !form.watch("longitude")) && (
											<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600 bg-amber-50 p-2.5 sm:p-3 rounded-lg">
												<MapPin className="w-4 h-4 shrink-0" />
												<span>
													Haz clic en el mapa o busca una dirección para
													seleccionar la ubicación de tu tienda
												</span>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Step 3: Configuración */}
							{currentStep === 3 && (
								<div className="space-y-6">
									<div>
										<h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
											Servicios disponibles
										</h3>
										<div className="space-y-3 sm:space-y-4">
											<FormField
												control={form.control}
												name="acceptsDelivery"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
														<div className="space-y-0.5 min-w-0 flex-1">
															<FormLabel className="flex items-center gap-2 text-sm sm:text-base">
																<Truck className="w-4 h-4 shrink-0" />
																<span>Servicio a domicilio</span>
															</FormLabel>
															<FormDescription className="text-xs sm:text-sm">
																Ofrece entrega de productos en el domicilio del
																cliente
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="acceptsPickup"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
														<div className="space-y-0.5 min-w-0 flex-1">
															<FormLabel className="flex items-center gap-2 text-sm sm:text-base">
																<ShoppingBag className="w-4 h-4 shrink-0" />
																<span>Recolección en tienda</span>
															</FormLabel>
															<FormDescription className="text-xs sm:text-sm">
																Los clientes pueden recoger sus pedidos en tu
																tienda
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="acceptsReservations"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
														<div className="space-y-0.5 min-w-0 flex-1">
															<FormLabel className="flex items-center gap-2 text-sm sm:text-base">
																<Calendar className="w-4 h-4 shrink-0" />
																<span>Reservaciones</span>
															</FormLabel>
															<FormDescription className="text-xs sm:text-sm">
																Permite a los clientes hacer reservaciones
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</div>

									{/* Sección de Tags */}
									<div>
										<FormField
											control={form.control}
											name="tags"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<TagSelector
															value={field.value || []}
															onChange={field.onChange}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* Sección de Métodos de Pago */}
									<div>
										<h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
											Métodos de pago
										</h3>
										<div className="space-y-3 sm:space-y-4">
											<FormField
												control={form.control}
												name="acceptsCash"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 gap-3">
														<div className="space-y-0.5 min-w-0 flex-1">
															<FormLabel className="flex items-center gap-2 text-sm sm:text-base">
																<DollarSign className="w-4 h-4 shrink-0" />
																<span>Efectivo</span>
															</FormLabel>
															<FormDescription className="text-xs sm:text-sm">
																Acepta pagos en efectivo al momento de la
																entrega o retiro
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											{form.watch("acceptsCash") && (
												<div className="ml-4 sm:ml-8">
													<FormField
														control={form.control}
														name="cashDiscountPercentage"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-sm">
																	Descuento por pago en efectivo (%)
																</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		placeholder="0"
																		min="0"
																		max="100"
																		step="0.5"
																		{...field}
																		onChange={(e) =>
																			field.onChange(e.target.value || "0")
																		}
																	/>
																</FormControl>
																<FormDescription className="text-xs">
																	Opcional. Ofrece un descuento a quienes paguen
																	en efectivo.
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											)}

											<div className="rounded-lg border p-3 sm:p-4 bg-muted/50">
												<div className="flex items-center gap-2 mb-2">
													<CreditCard className="w-4 h-4 shrink-0" />
													<span className="text-sm sm:text-base font-medium">
														Mercado Pago
													</span>
												</div>
												<p className="text-xs sm:text-sm text-muted-foreground">
													Podrás vincular tu cuenta de Mercado Pago después de
													crear tu tienda, desde la sección de configuración.
												</p>
											</div>
										</div>
									</div>

									{form.watch("acceptsDelivery") && (
										<div>
											<h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
												Configuración de entrega
											</h3>
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
												<FormField
													control={form.control}
													name="deliveryRadius"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Radio de entrega (km)
															</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	placeholder="5"
																	{...field}
																	onChange={(e) =>
																		field.onChange(
																			Number.parseFloat(e.target.value) || 0,
																		)
																	}
																/>
															</FormControl>
															<div className="min-h-[20px]">
																<FormMessage />
															</div>
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="minimumOrder"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Pedido mínimo ($)
															</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	placeholder="100"
																	{...field}
																	onChange={(e) =>
																		field.onChange(e.target.value || "0")
																	}
																/>
															</FormControl>
															<div className="min-h-[20px]">
																<FormMessage />
															</div>
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="deliveryFee"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm">
																Costo de entrega ($)
															</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	placeholder="30"
																	{...field}
																	onChange={(e) =>
																		field.onChange(e.target.value || "0")
																	}
																/>
															</FormControl>
															<div className="min-h-[20px]">
																<FormMessage />
															</div>
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
								<div className="space-y-3 sm:space-y-4">
									<div>
										<h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4">
											Horarios de atención
										</h3>
										<p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
											Define los horarios en que tu tienda estará disponible
											para recibir pedidos. Puedes agregar múltiples turnos por
											día.
										</p>
									</div>

									{/* Contenedor con altura fija para mensajes de estado */}
									<div className="min-h-[44px] sm:min-h-[48px]">
										{/* Mensaje de error si no hay días activos */}
										{form.formState.errors.businessHours ? (
											<div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 sm:p-3 rounded-lg border border-red-200">
												<Clock className="w-4 h-4 shrink-0" />
												<span>
													Debes tener al menos un día con horario de atención
													activo
												</span>
											</div>
										) : (
											/* Indicador de días activos */
											(() => {
												const openDays =
													form
														.watch("businessHours")
														?.filter((day) => !day.isClosed).length || 0;
												if (openDays === 0) {
													return (
														<div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600 bg-amber-50 p-2.5 sm:p-3 rounded-lg">
															<Clock className="w-4 h-4 shrink-0" />
															<span>
																Activa al menos un día para que tus clientes
																sepan cuándo pueden visitarte
															</span>
														</div>
													);
												}
												return (
													<div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 p-2.5 sm:p-3 rounded-lg">
														<CheckCircle className="w-4 h-4 shrink-0" />
														<span>
															{openDays}{" "}
															{openDays === 1 ? "día activo" : "días activos"}
														</span>
													</div>
												);
											})()
										)}
									</div>

									<div className="space-y-3 sm:space-y-4">
										{DAYS_OF_WEEK.map((day, dayIndex) => {
											const isClosed = form.watch(
												`businessHours.${dayIndex}.isClosed`,
											);
											const timeSlots =
												form.watch(`businessHours.${dayIndex}.timeSlots`) || [];

											return (
												<div
													key={dayIndex}
													className="p-2.5 sm:p-4 border rounded-lg space-y-2 sm:space-y-3"
												>
													<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
														<div className="flex items-center gap-2 sm:gap-4">
															<FormField
																control={form.control}
																name={`businessHours.${dayIndex}.isClosed`}
																render={({ field }) => (
																	<FormItem className="flex items-center space-x-2">
																		<FormControl>
																			<Switch
																				checked={!field.value}
																				onCheckedChange={(checked) =>
																					field.onChange(!checked)
																				}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<div className="w-20 sm:w-24 text-xs sm:text-sm font-medium">
																{day}
															</div>
														</div>

														{!isClosed && (
															<div className="flex-1 space-y-2">
																{timeSlots.map((_, slotIndex) => (
																	<div
																		key={slotIndex}
																		className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap"
																	>
																		<FormField
																			control={form.control}
																			name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.openTime`}
																			render={({ field }) => (
																				<FormItem>
																					<FormControl>
																						<Input
																							type="time"
																							className="w-[5.5rem] sm:w-32 text-sm"
																							{...field}
																						/>
																					</FormControl>
																				</FormItem>
																			)}
																		/>
																		<span className="text-xs sm:text-sm text-gray-500">
																			-
																		</span>
																		<FormField
																			control={form.control}
																			name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.closeTime`}
																			render={({ field }) => (
																				<FormItem>
																					<FormControl>
																						<Input
																							type="time"
																							className="w-[5.5rem] sm:w-32 text-sm"
																							{...field}
																						/>
																					</FormControl>
																				</FormItem>
																			)}
																		/>
																		{slotIndex === 0 ? (
																			<Button
																				type="button"
																				variant="ghost"
																				size="icon"
																				className="h-8 w-8 sm:h-9 sm:w-9"
																				onClick={() => addTimeSlot(dayIndex)}
																				title="Agregar turno"
																			>
																				<Plus className="w-4 h-4" />
																			</Button>
																		) : (
																			<Button
																				type="button"
																				variant="ghost"
																				size="icon"
																				className="h-8 w-8 sm:h-9 sm:w-9"
																				onClick={() =>
																					removeTimeSlot(dayIndex, slotIndex)
																				}
																				title="Eliminar turno"
																			>
																				<Trash2 className="w-4 h-4" />
																			</Button>
																		)}
																	</div>
																))}
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Step 5: Resumen */}
							{currentStep === 5 && (
								<div className="space-y-4 sm:space-y-6">
									<div>
										<h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4">
											Resumen de configuración
										</h3>
										<p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
											Revisa la información antes de crear tu tienda
										</p>
									</div>

									<div className="space-y-3 sm:space-y-4">
										{/* Información básica */}
										<div className="border rounded-lg p-3 sm:p-4">
											<h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
												<Store className="w-4 h-4 shrink-0" />
												Información básica
											</h4>
											<div className="space-y-1 text-xs sm:text-sm">
												<p>
													<strong>Nombre:</strong> {form.watch("name")}
												</p>
												{form.watch("description") && (
													<p className="break-words">
														<strong>Descripción:</strong>{" "}
														{form.watch("description")}
													</p>
												)}
												{form.watch("phone") && (
													<p>
														<strong>Teléfono:</strong> {form.watch("phone")}
													</p>
												)}
												{form.watch("email") && (
													<p className="break-all">
														<strong>Email:</strong> {form.watch("email")}
													</p>
												)}
											</div>
										</div>

										{/* Ubicación */}
										<div className="border rounded-lg p-3 sm:p-4">
											<h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
												<MapPin className="w-4 h-4 shrink-0" />
												Ubicación
											</h4>
											<div className="text-xs sm:text-sm">
												<p className="break-words">{form.watch("address")}</p>
											</div>
										</div>

										{/* Servicios */}
										<div className="border rounded-lg p-3 sm:p-4">
											<h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
												<Settings className="w-4 h-4 shrink-0" />
												Servicios
											</h4>
											<div className="flex flex-wrap gap-1.5 sm:gap-2">
												{form.watch("acceptsDelivery") && (
													<Badge
														variant="secondary"
														className="text-xs sm:text-sm"
													>
														Entrega a domicilio
													</Badge>
												)}
												{form.watch("acceptsPickup") && (
													<Badge
														variant="secondary"
														className="text-xs sm:text-sm"
													>
														Recolección en tienda
													</Badge>
												)}
												{form.watch("acceptsReservations") && (
													<Badge
														variant="secondary"
														className="text-xs sm:text-sm"
													>
														Reservaciones
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Navigation */}
					<div className="flex justify-between mt-4 sm:mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={prevStep}
							disabled={currentStep === 1}
							className="flex items-center gap-1 sm:gap-2 bg-transparent text-sm sm:text-base px-3 sm:px-4"
						>
							<ChevronLeft className="w-4 h-4" />
							<span className="hidden xs:inline">Anterior</span>
						</Button>

						{currentStep < STEPS.length ? (
							<Button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									nextStep();
								}}
								className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
							>
								<span className="hidden xs:inline">Siguiente</span>
								<span className="xs:hidden">Sig.</span>
								<ChevronRight className="w-4 h-4" />
							</Button>
						) : (
							<Button
								type="submit"
								disabled={mutation.isPending || currentStep !== STEPS.length}
								className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
							>
								{mutation.isPending ? "Creando..." : "Crear Tienda"}
								<CheckCircle className="w-4 h-4" />
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}
