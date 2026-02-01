import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreateProductSchema,
	createProductSchema,
} from "@repo/db/src/types/product";
import type { SelectShop } from "@repo/db/src/types/shop";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Dice3Icon, InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { getProductCategoriesByShopId } from "../../../../../api/categories";
import { createProduct } from "../../../../../api/products";
import {
	ImageUploadField,
	type UploadedImageData,
} from "../../../../../components/image-upload-field";
import { ProductCategorySelect } from "./product-category-select";

export const NewProductForm = ({ shop }: { shop: SelectShop | undefined }) => {
	const navigate = useNavigate();
	const form = useForm<CreateProductSchema>({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			name: "",
			description: "",
			price: "",
			sku: "",
			quantity: 0,
			lowStockThreshold: 0,
			images: [],
			isActive: true,
			tags: [],
			sortOrder: 0,
			isFeatured: false,
		},
	});

	const mutation = useMutation({
		mutationFn: async (product: CreateProductSchema) => {
			const result = await createProduct(product);
			return result;
		},
		onSuccess: (data) => {
			toast.success("Producto creado exitosamente");
			form.reset();
			// Redirigir a la página de edición para agregar modificadores
			if (data?.id) {
				navigate({
					to: "/dashboard/productos/editar-producto/$productId",
					params: { productId: String(data.id) },
				});
			}
		},
		onError: () => {
			toast.error("Error al crear el producto");
		},
	});

	const { data: productCategories, isLoading } = useQuery({
		queryKey: ["productCategories", shop?.id],
		queryFn: () => getProductCategoriesByShopId(shop?.id),
	});

	async function onSubmit(values: CreateProductSchema) {
		mutation.mutate(values);
	}

	const handleImagesChange = (images: UploadedImageData[]) => {
		form.setValue(
			"images",
			images.map((img) => img.url),
			{ shouldValidate: true },
		);
	};

	return (
		<Form {...form}>
			<Alert className="mb-6">
				<InfoIcon className="h-4 w-4" />
				<AlertDescription>
					Los modificadores (tamaños, opciones, extras) se pueden agregar
					después de crear el producto. Serás redirigido a la página de edición
					del producto una vez creado.
				</AlertDescription>
			</Alert>
			<form
				onSubmit={form.handleSubmit(onSubmit, (errors) => {
					console.log("Errores de validación:", errors);
				})}
				className="space-y-6 "
			>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre</FormLabel>
								<FormControl>
									<Input
										placeholder="Pizza Margherita"
										{...field}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>
									El nombre del producto debe tener entre 1 y 100 caracteres.
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
									<Input
										placeholder="Una deliciosa pizza..."
										{...field}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>
									La descripción debe tener máximo 100 caracteres.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Precio</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="0"
										{...field}
										onChange={(e) => field.onChange(e.target.value)}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>El precio debe ser mayor a 0.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Categoría</FormLabel>
								<FormControl>
									<ProductCategorySelect
										productCategories={productCategories ?? []}
										value={field.value}
										onChange={field.onChange}
										disabled={mutation.isPending || isLoading}
										shopId={shop?.id}
									/>
								</FormControl>
								<FormDescription>
									Selecciona la categoría del producto.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="sku"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SKU</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder="PIZZA-001"
											{...field}
											disabled={mutation.isPending}
										/>
										<Button
											type="button"
											variant="ghost"
											className="absolute right-[2px] top-[2px] p-1 h-8 w-8"
											onClick={() => {
												if (form.watch("name").length === 0) {
													toast.error(
														"El nombre del producto es requerido para generar el SKU",
													);
													return;
												}
												field.onChange(
													`${form.watch("name").split(" ").join("-")}-${Math.floor(Math.random() * 1000)}`,
												);
											}}
											disabled={mutation.isPending}
										>
											<Dice3Icon className="size-4" />
										</Button>
									</div>
								</FormControl>
								<FormDescription>
									El SKU es un identificador único. Podés generarlo
									automáticamente.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cantidad</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="0"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>
									Cantidad de productos disponibles.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lowStockThreshold"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Alerta de stock bajo</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="0"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>
									Recibirás una alerta cuando el stock esté por debajo de este
									número.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isActive"
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
									<FormLabel>Activo</FormLabel>
									<FormDescription>
										Indica si el producto está activo y disponible para la
										venta.
									</FormDescription>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isFeatured"
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
									<FormLabel>Destacado</FormLabel>
									<FormDescription>
										Indica si el producto debe ser destacado en la tienda.
									</FormDescription>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="images"
						render={() => (
							<FormItem className="col-span-1 lg:col-span-2">
								<FormLabel>Imágenes del producto *</FormLabel>
								<FormControl>
									<ImageUploadField
										type="product-image"
										onImagesChange={handleImagesChange}
										multiple={true}
										maxFiles={6}
										maxSizeMB={5}
										disabled={mutation.isPending}
									/>
								</FormControl>
								<FormDescription>
									Sube al menos una imagen del producto. Máximo 6 imágenes.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="col-span-1 col-start-1"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? (
							<>
								<Spinner />
								Creando producto...
							</>
						) : (
							"Crear Producto"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};
