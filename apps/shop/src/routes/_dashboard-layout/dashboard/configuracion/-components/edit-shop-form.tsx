import { zodResolver } from "@hookform/resolvers/zod";
import {
	type SelectShop,
	type UpdateShop,
	updateShopSchema,
} from "@repo/db/src/types/shop";
import {
	type MapLocation,
	MapWithAutocomplete,
} from "@repo/ui/components/map-with-autocomplete";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
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
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateShop } from "../../../../../api/shops";
import {
	ImageUploadField,
	type UploadedImageData,
} from "../../../../../components/image-upload-field";

interface EditShopFormProps {
	shop: SelectShop;
}

export const EditShopForm = ({ shop }: EditShopFormProps) => {
	const queryClient = useQueryClient();
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

	const form = useForm<UpdateShop>({
		resolver: zodResolver(updateShopSchema),
		defaultValues: {
			name: shop.name,
			description: shop.description ?? undefined,
			phone: shop.phone ?? undefined,
			email: shop.email ?? undefined,
			website: shop.website ?? undefined,
			address: shop.address ?? undefined,
			latitude: shop.latitude ?? undefined,
			longitude: shop.longitude ?? undefined,
			deliveryRadius: shop.deliveryRadius ?? 0,
			minimumOrder: shop.minimumOrder ?? "0",
			deliveryFee: shop.deliveryFee ?? "0",
			acceptsDelivery: shop.acceptsDelivery ?? true,
			acceptsPickup: shop.acceptsPickup ?? true,
			acceptsReservations: shop.acceptsReservations ?? false,
			logo: shop.logo ?? undefined,
			banner: shop.banner ?? undefined,
			tags: shop.tags ?? [],
		},
	});

	const mutation = useMutation({
		mutationFn: async (shopData: UpdateShop) => {
			return await updateShop(shopData, shop.id);
		},
		onSuccess: () => {
			toast.success("Tienda actualizada exitosamente");
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
		onError: (error) => {
			toast.error("Error al actualizar la tienda");
			console.error("Error updating shop:", error);
		},
	});

	async function onSubmit(values: UpdateShop) {
		mutation.mutate(values);
	}

	const handleLogoChange = (images: UploadedImageData[]) => {
		if (images.length > 0) {
			form.setValue("logo", images[0].url, { shouldValidate: true });
		} else {
			form.setValue("logo", "", { shouldValidate: true });
		}
	};

	const handleBannerChange = (images: UploadedImageData[]) => {
		if (images.length > 0) {
			form.setValue("banner", images[0].url, { shouldValidate: true });
		} else {
			form.setValue("banner", "", { shouldValidate: true });
		}
	};

	// Preparar las imágenes iniciales
	const initialLogo: UploadedImageData[] = shop.logo
		? [{ url: shop.logo, key: shop.logo }]
		: [];
	const initialBanner: UploadedImageData[] = shop.banner
		? [{ url: shop.banner, key: shop.banner }]
		: [];

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, (errors) => {
					console.log("Errores de validación:", errors);
				})}
				className="space-y-8"
			>
				{/* Información básica */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Información básica</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre de la tienda *</FormLabel>
									<FormControl>
										<Input
											placeholder="Mi Tienda"
											{...field}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										El nombre que verán tus clientes.
									</FormDescription>
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
											placeholder="Una breve descripción de tu tienda..."
											{...field}
											disabled={mutation.isPending}
											className="resize-none"
										/>
									</FormControl>
									<FormDescription>Máximo 100 caracteres.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Información de contacto */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Información de contacto</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Teléfono</FormLabel>
									<FormControl>
										<Input
											placeholder="+54 11 1234-5678"
											{...field}
											disabled={mutation.isPending}
										/>
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
											type="email"
											placeholder="tienda@ejemplo.com"
											{...field}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sitio web</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://mitienda.com"
											{...field}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Ubicación */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Ubicación</h3>
					<MapWithAutocomplete
						initialAddress={shop.address ?? ""}
						initialLat={shop.latitude ? parseFloat(shop.latitude) : undefined}
						initialLng={shop.longitude ? parseFloat(shop.longitude) : undefined}
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
						placeholder="Calle 123, Ciudad"
						disabled={mutation.isPending}
						mapHeight="16rem"
						locationRestriction={{
							south: -33.04,
							west: -60.74,
							north: -32.9,
							east: -60.6,
						}}
					/>
				</div>

				{/* Configuración de entregas */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Configuración de entregas</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormField
							control={form.control}
							name="deliveryRadius"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Radio de entrega (metros)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="5000"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
											value={field.value ?? ""}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										Distancia máxima para entregas.
									</FormDescription>
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
											placeholder="0"
											{...field}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										Monto mínimo para realizar un pedido.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="deliveryFee"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Costo de envío ($)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										Tarifa de entrega a domicilio.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Opciones de servicio */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Opciones de servicio</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<FormField
							control={form.control}
							name="acceptsDelivery"
							render={({ field }) => (
								<FormItem className="flex items-start p-4 border rounded-md">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<div className="grid gap-2">
										<FormLabel>Acepta entregas</FormLabel>
										<FormDescription>
											Permite que los clientes reciban pedidos a domicilio.
										</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="acceptsPickup"
							render={({ field }) => (
								<FormItem className="flex items-start p-4 border rounded-md">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<div className="grid gap-2">
										<FormLabel>Acepta retiro</FormLabel>
										<FormDescription>
											Permite que los clientes retiren sus pedidos en la tienda.
										</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="acceptsReservations"
							render={({ field }) => (
								<FormItem className="flex items-start p-4 border rounded-md">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<div className="grid gap-2">
										<FormLabel>Acepta reservas</FormLabel>
										<FormDescription>
											Permite que los clientes realicen reservas.
										</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Tags */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium flex items-center gap-2">
						<Tag className="w-5 h-5" />
						Tags de tu negocio
					</h3>
					<p className="text-sm text-muted-foreground">
						Agrega etiquetas que describan tu negocio para que los clientes te
						encuentren más fácilmente
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
												disabled={mutation.isPending}
											/>
											<Button
												type="button"
												variant="outline"
												disabled={mutation.isPending}
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
																	field.value?.filter((t) => t !== tag),
																);
															}}
															className="ml-1 hover:opacity-70 transition-opacity"
															disabled={mutation.isPending}
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
															if (!mutation.isPending) {
																field.onChange([...(field.value || []), tag]);
															}
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

				{/* Imágenes */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Imágenes</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="logo"
							render={() => (
								<FormItem>
									<FormLabel>Logo de la tienda</FormLabel>
									<FormControl>
										<ImageUploadField
											type="shop-logo"
											onImagesChange={handleLogoChange}
											initialImages={initialLogo}
											multiple={false}
											maxFiles={1}
											maxSizeMB={2}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										Imagen cuadrada recomendada (200x200px).
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="banner"
							render={() => (
								<FormItem>
									<FormLabel>Banner de la tienda</FormLabel>
									<FormControl>
										<ImageUploadField
											type="shop-banner"
											onImagesChange={handleBannerChange}
											initialImages={initialBanner}
											multiple={false}
											maxFiles={1}
											maxSizeMB={5}
											disabled={mutation.isPending}
										/>
									</FormControl>
									<FormDescription>
										Imagen panorámica recomendada (1200x400px).
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={mutation.isPending}
						className="min-w-[200px]"
					>
						{mutation.isPending ? (
							<>
								<Spinner />
								Guardando cambios...
							</>
						) : (
							"Guardar cambios"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};
