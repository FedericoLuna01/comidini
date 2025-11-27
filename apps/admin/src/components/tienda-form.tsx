"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Clock, MapPin, Phone, Store, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const businessHoursSchema = z.object({
	dayOfWeek: z.number().min(0).max(6),
	openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	isClosed: z.boolean(),
});

const shopFormSchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	description: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email("Email inválido").optional().or(z.literal("")),
	website: z.string().url("URL inválida").optional().or(z.literal("")),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	country: z.string().optional(),
	postalCode: z.string().optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	deliveryRadius: z.number().min(0).optional(),
	minimumOrder: z.number().min(0).optional(),
	deliveryFee: z.number().min(0).optional(),
	acceptsDelivery: z.boolean(),
	acceptsPickup: z.boolean(),
	acceptsReservations: z.boolean(),
	businessHours: z.array(businessHoursSchema),
	categoryIds: z.array(z.string()),
});

type ShopFormData = z.infer<typeof shopFormSchema>;

const DAYS_OF_WEEK = [
	{ value: 0, label: "Domingo" },
	{ value: 1, label: "Lunes" },
	{ value: 2, label: "Martes" },
	{ value: 3, label: "Miércoles" },
	{ value: 4, label: "Jueves" },
	{ value: 5, label: "Viernes" },
	{ value: 6, label: "Sábado" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
	Array.from({ length: 4 }, (_, minute) => {
		const minuteValue = minute * 15;
		return `${hour.toString().padStart(2, "0")}:${minuteValue.toString().padStart(2, "0")}`;
	}),
).flat();

export function TiendaForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ShopFormData>({
		resolver: zodResolver(shopFormSchema),
		defaultValues: {
			name: "",
			description: "",
			phone: "",
			email: "",
			website: "",
			address: "",
			city: "",
			state: "",
			country: "",
			postalCode: "",
			acceptsDelivery: true,
			acceptsPickup: true,
			acceptsReservations: false,
			businessHours: DAYS_OF_WEEK.map((day) => ({
				dayOfWeek: day.value,
				openTime: "09:00",
				closeTime: "18:00",
				isClosed: day.value === 0, // Domingo cerrado por defecto
			})),
			categoryIds: [],
		},
	});

	const onSubmit = async (data: ShopFormData) => {
		setIsSubmitting(true);
		try {
			console.log("Datos del formulario:", data);
			// Aquí iría la lógica para enviar los datos al servidor
			// await createShop(data);
		} catch (error) {
			console.error("Error al crear la tienda:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Configurar Mi Tienda</h1>
				<p className="text-muted-foreground">
					Completa la información de tu tienda para que los clientes puedan
					encontrarte.
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Información Básica */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Store className="h-5 w-5" />
								Información Básica
							</CardTitle>
							<CardDescription>
								Información principal de tu tienda
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre de la Tienda *</FormLabel>
										<FormControl>
											<Input placeholder="Mi Restaurante" {...field} />
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
												placeholder="Describe tu tienda, especialidades, etc."
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Una breve descripción de tu tienda para los clientes
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Información de Contacto */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-5 w-5" />
								Información de Contacto
							</CardTitle>
							<CardDescription>
								Datos de contacto para que los clientes puedan comunicarse
								contigo
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Teléfono</FormLabel>
											<FormControl>
												<Input placeholder="+1 234 567 8900" {...field} />
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
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder="tienda@ejemplo.com"
													type="email"
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
										<FormLabel>Sitio Web</FormLabel>
										<FormControl>
											<Input placeholder="https://mitienda.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Ubicación */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								Ubicación
							</CardTitle>
							<CardDescription>
								Dirección y coordenadas de tu tienda
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Dirección</FormLabel>
										<FormControl>
											<Input placeholder="Calle Principal 123" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ciudad</FormLabel>
											<FormControl>
												<Input placeholder="Ciudad" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Estado/Provincia</FormLabel>
											<FormControl>
												<Input placeholder="Estado" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="postalCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Código Postal</FormLabel>
											<FormControl>
												<Input placeholder="12345" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="latitude"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Latitud</FormLabel>
											<FormControl>
												<Input
													placeholder="40.7128"
													type="number"
													step="any"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseFloat(e.target.value)
																: undefined,
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
									name="longitude"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Longitud</FormLabel>
											<FormControl>
												<Input
													placeholder="-74.0060"
													type="number"
													step="any"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseFloat(e.target.value)
																: undefined,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Configuración de Entrega */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Truck className="h-5 w-5" />
								Configuración de Entrega
							</CardTitle>
							<CardDescription>
								Configura las opciones de entrega y recogida
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="deliveryRadius"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Radio de Entrega (metros)</FormLabel>
											<FormControl>
												<Input
													placeholder="5000"
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseInt(e.target.value)
																: undefined,
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
											<FormLabel>Pedido Mínimo ($)</FormLabel>
											<FormControl>
												<Input
													placeholder="10.00"
													type="number"
													step="0.01"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseFloat(e.target.value)
																: undefined,
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
									name="deliveryFee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Costo de Entrega ($)</FormLabel>
											<FormControl>
												<Input
													placeholder="2.50"
													type="number"
													step="0.01"
													{...field}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseFloat(e.target.value)
																: undefined,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-y-4">
								<FormField
									control={form.control}
									name="acceptsDelivery"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">
													Acepta Entregas
												</FormLabel>
												<FormDescription>
													Los clientes pueden solicitar entrega a domicilio
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
												<FormLabel className="text-base">
													Acepta Recogida
												</FormLabel>
												<FormDescription>
													Los clientes pueden recoger en tu tienda
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
												<FormLabel className="text-base">
													Acepta Reservas
												</FormLabel>
												<FormDescription>
													Los clientes pueden hacer reservas
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
						</CardContent>
					</Card>

					{/* Horarios de Negocio */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Horarios de Negocio
							</CardTitle>
							<CardDescription>
								Configura los horarios de apertura y cierre para cada día
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{form.watch("businessHours").map((hour, index) => (
									<div
										key={index}
										className="flex items-center gap-4 p-4 border rounded-lg"
									>
										<div className="w-24">
											<span className="text-sm font-medium">
												{DAYS_OF_WEEK[hour.dayOfWeek].label}
											</span>
										</div>

										<div className="flex items-center gap-2">
											<Switch
												checked={!hour.isClosed}
												onCheckedChange={(checked) => {
													const newHours = [...form.watch("businessHours")];
													newHours[index] = { ...hour, isClosed: !checked };
													form.setValue("businessHours", newHours);
												}}
											/>
											<span className="text-sm text-muted-foreground">
												{hour.isClosed ? "Cerrado" : "Abierto"}
											</span>
										</div>

										{!hour.isClosed && (
											<div className="flex items-center gap-2">
												<Select
													value={hour.openTime}
													onValueChange={(value) => {
														const newHours = [...form.watch("businessHours")];
														newHours[index] = { ...hour, openTime: value };
														form.setValue("businessHours", newHours);
													}}
												>
													<SelectTrigger className="w-24">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{TIME_OPTIONS.map((time) => (
															<SelectItem key={time} value={time}>
																{time}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<span className="text-sm">a</span>

												<Select
													value={hour.closeTime}
													onValueChange={(value) => {
														const newHours = [...form.watch("businessHours")];
														newHours[index] = { ...hour, closeTime: value };
														form.setValue("businessHours", newHours);
													}}
												>
													<SelectTrigger className="w-24">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{TIME_OPTIONS.map((time) => (
															<SelectItem key={time} value={time}>
																{time}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Guardando..." : "Guardar Tienda"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
