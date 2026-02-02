import { zodResolver } from "@hookform/resolvers/zod";
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
import { createFileRoute } from "@tanstack/react-router";
import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Globe,
	Mail,
	MapPin,
	Phone,
	Plus,
	Settings,
	ShoppingBag,
	Store,
	Tag,
	Trash2,
	Truck,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { createShop } from "../../api/shops";

const timeSlotSchema = z.object({
	openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const businessHoursSchema = z.object({
	dayOfWeek: z.number().min(0).max(6),
	isClosed: z.boolean(),
	timeSlots: z.array(timeSlotSchema),
});

const formSchema = createShopSchema.extend({
	businessHours: z.array(businessHoursSchema),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/primeros-pasos/")({
	// TODO: add a loader to check if the user already has a shop
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
	const [currentStep, setCurrentStep] = useState(2);
	const [newTag, setNewTag] = useState("");

	// Colores de tags basados en la paleta de Comidini
	const TAG_COLORS = [
		{ bg: "oklch(0.92 0.08 12)", text: "oklch(0.35 0.12 12)" }, // Coral claro
		{ bg: "oklch(0.90 0.10 25)", text: "oklch(0.40 0.15 25)" }, // Naranja suave
		{ bg: "oklch(0.88 0.12 45)", text: "oklch(0.45 0.18 45)" }, // Amarillo cálido
		{ bg: "oklch(0.90 0.08 150)", text: "oklch(0.40 0.12 150)" }, // Verde menta
		{ bg: "oklch(0.88 0.10 200)", text: "oklch(0.40 0.15 200)" }, // Azul cielo
		{ bg: "oklch(0.90 0.10 280)", text: "oklch(0.45 0.15 280)" }, // Lavanda
	];

	const getTagColor = (tag: string) => {
		// Genera un índice consistente basado en el hash del tag
		let hash = 0;
		for (let i = 0; i < tag.length; i++) {
			hash = tag.charCodeAt(i) + ((hash << 5) - hash);
		}
		const color = TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
		return { backgroundColor: color.bg, color: color.text };
	};

	const DEFAULT_TAGS = [
		"Hamburguesas",
		"Delivery",
		"Aceptamos Crypto",
		"Comida Rápida",
		"Vegano",
		"Sin Gluten",
	];

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "Nombre de mi tienda",
			description: "",
			phone: "",
			address: "",
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
			// TODO: Redirigir al usuario a su tienda o dashboard
			console.log("Tienda creada exitosamente");
			alert("¡Tienda creada exitosamente!");
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
				return ["address"];
			case 3:
				return [
					"deliveryRadius",
					"minimumOrder",
					"deliveryFee",
					"acceptsDelivery",
					"acceptsPickup",
					"acceptsReservations",
				];
			case 4:
				return ["businessHours"];
			default:
				return [];
		}
	};

	const onSubmit = async (data: FormValues) => {
		// Limpiar datos: remover strings vacíos que causarían error de validación
		const cleanedData = {
			...data,
			email: data.email?.trim() || undefined,
			website: data.website?.trim() || undefined,
			phone: data.phone?.trim() || undefined,
			description: data.description?.trim() || undefined,
			businessHours: convertBusinessHoursForApi(data.businessHours),
		};

		console.log("Sending data:", cleanedData);
		mutation.mutate(cleanedData as unknown as CreateShop);
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
				<Stepper value={currentStep} onValueChange={setCurrentStep}>
					{STEPS.map(({ id, title, description }) => (
						<StepperItem
							key={id}
							step={id}
							className="relative flex-1 flex-col!"
						>
							<StepperTrigger
								className="flex-col gap-3 rounded"
								onClick={async () => {
									const isValid = await isValidForm();
									if (!isValid) return;
									setCurrentStep(id);
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
													Una breve descripción ayudará a los clientes a conocer
													tu negocio
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
														<Input
															placeholder="contacto@mitienda.com"
															{...field}
														/>
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
													<Input
														placeholder="https://www.mitienda.com"
														{...field}
													/>
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
									<MapWithAutocomplete
										initialAddress={form.getValues("address")}
										initialLat={
											form.getValues("latitude")
												? parseFloat(form.getValues("latitude") ?? "")
												: undefined
										}
										initialLng={
											form.getValues("longitude")
												? parseFloat(form.getValues("longitude") ?? "")
												: undefined
										}
										onLocationChange={(location: MapLocation) => {
											form.setValue("address", location.address, {
												shouldValidate: true,
											});
											form.setValue("latitude", location.lat.toString(), {
												shouldValidate: true,
											});
											form.setValue("longitude", location.lng.toString(), {
												shouldValidate: true,
											});
										}}
										googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
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
								</div>
							)}

							{/* Step 3: Configuración */}
							{currentStep === 3 && (
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium mb-4">
											Servicios disponibles
										</h3>
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
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
														<div className="space-y-0.5">
															<FormLabel className="flex items-center gap-2 text-base">
																<ShoppingBag className="w-4 h-4" />
																Recolección en tienda
															</FormLabel>
															<FormDescription>
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
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
														<div className="space-y-0.5">
															<FormLabel className="flex items-center gap-2 text-base">
																<Calendar className="w-4 h-4" />
																Reservaciones
															</FormLabel>
															<FormDescription>
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
										<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
											<Tag className="w-5 h-5" />
											Tags de tu negocio
										</h3>
										<p className="text-sm text-gray-600 mb-4">
											Agrega etiquetas que describan tu negocio para que los
											clientes te encuentren más fácilmente
										</p>

										<FormField
											control={form.control}
											name="tags"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className="space-y-4">
															{/* Input para agregar nuevo tag */}
															<div className="flex gap-2">
																<Input
																	placeholder="Escribe un tag y presiona Enter..."
																	value={newTag}
																	onChange={(e) => setNewTag(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") {
																			e.preventDefault();
																			const trimmedTag = newTag.trim();
																			if (
																				trimmedTag &&
																				!field.value?.includes(trimmedTag)
																			) {
																				field.onChange([
																					...(field.value || []),
																					trimmedTag,
																				]);
																				setNewTag("");
																			}
																		}
																	}}
																/>
																<Button
																	type="button"
																	variant="outline"
																	onClick={() => {
																		const trimmedTag = newTag.trim();
																		if (
																			trimmedTag &&
																			!field.value?.includes(trimmedTag)
																		) {
																			field.onChange([
																				...(field.value || []),
																				trimmedTag,
																			]);
																			setNewTag("");
																		}
																	}}
																>
																	<Plus className="w-4 h-4" />
																</Button>
															</div>

															{/* Tags seleccionados */}
															{field.value && field.value.length > 0 && (
																<div className="flex flex-wrap gap-2">
																	{field.value.map((tag) => (
																		<Badge
																			key={tag}
																			className="px-3 py-1.5 text-sm flex items-center gap-1 border-0"
																			style={getTagColor(tag)}
																		>
																			{tag}
																			<button
																				type="button"
																				onClick={() => {
																					field.onChange(
																						field.value?.filter(
																							(t) => t !== tag,
																						),
																					);
																				}}
																				className="ml-1 hover:opacity-70 transition-opacity"
																			>
																				<X className="w-3 h-3" />
																			</button>
																		</Badge>
																	))}
																</div>
															)}

															{/* Tags sugeridos */}
															<div>
																<p className="text-sm text-muted-foreground mb-2">
																	Sugerencias:
																</p>
																<div className="flex flex-wrap gap-2">
																	{DEFAULT_TAGS.filter(
																		(tag) => !field.value?.includes(tag),
																	).map((tag) => (
																		<Badge
																			key={tag}
																			className="px-3 py-1.5 text-sm cursor-pointer transition-all hover:scale-105 hover:shadow-sm border-0 opacity-70 hover:opacity-100"
																			style={getTagColor(tag)}
																			onClick={() => {
																				field.onChange([
																					...(field.value || []),
																					tag,
																				]);
																			}}
																		>
																			<Plus className="w-3 h-3 mr-1" />
																			{tag}
																		</Badge>
																	))}
																</div>
															</div>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{form.watch("acceptsDelivery") && (
										<div>
											<h3 className="text-lg font-medium mb-4">
												Configuración de entrega
											</h3>
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
																	onChange={(e) =>
																		field.onChange(
																			Number.parseFloat(e.target.value) || 0,
																		)
																	}
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
																	onChange={(e) =>
																		field.onChange(e.target.value || "0")
																	}
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
																	onChange={(e) =>
																		field.onChange(e.target.value || "0")
																	}
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
										<h3 className="text-lg font-medium mb-4">
											Horarios de atención
										</h3>
										<p className="text-sm text-gray-600 mb-6">
											Define los horarios en que tu tienda estará disponible
											para recibir pedidos. Puedes agregar múltiples turnos por
											día.
										</p>
									</div>
									<div className="space-y-4">
										{DAYS_OF_WEEK.map((day, dayIndex) => {
											const isClosed = form.watch(
												`businessHours.${dayIndex}.isClosed`,
											);
											const timeSlots =
												form.watch(`businessHours.${dayIndex}.timeSlots`) || [];

											return (
												<div
													key={dayIndex}
													className="p-4 border rounded-lg space-y-3"
												>
													<div className="flex items-center gap-4">
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
														<div className="w-24 text-sm font-medium">
															{day}
														</div>

														{!isClosed && (
															<div className="flex-1 space-y-2">
																{timeSlots.map((_, slotIndex) => (
																	<div
																		key={slotIndex}
																		className="flex items-center gap-2"
																	>
																		<FormField
																			control={form.control}
																			name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.openTime`}
																			render={({ field }) => (
																				<FormItem>
																					<FormControl>
																						<Input
																							type="time"
																							className="w-32"
																							{...field}
																						/>
																					</FormControl>
																				</FormItem>
																			)}
																		/>
																		<span className="text-sm text-gray-500">
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
																							className="w-32"
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
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium mb-4">
											Resumen de configuración
										</h3>
										<p className="text-sm text-gray-600 mb-6">
											Revisa la información antes de crear tu tienda
										</p>
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
												{form.watch("acceptsDelivery") && (
													<Badge variant="secondary">Entrega a domicilio</Badge>
												)}
												{form.watch("acceptsPickup") && (
													<Badge variant="secondary">
														Recolección en tienda
													</Badge>
												)}
												{form.watch("acceptsReservations") && (
													<Badge variant="secondary">Reservaciones</Badge>
												)}
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
									e.preventDefault();
									nextStep();
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
	);
}
