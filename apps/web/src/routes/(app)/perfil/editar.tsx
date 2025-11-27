import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
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
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ImageUpload } from "../../../components/image-upload";

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
	image: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

function RouteComponent() {
	const navigate = useNavigate();
	const { data } = authClient.useSession();

	const [imagePreview, setImagePreview] = useState(data?.user.image || "");
	const [isLoading, setIsLoading] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(
		data?.user.image || undefined,
	);
	const [uploadedImageKey, setUploadedImageKey] = useState<
		string | undefined
	>();

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
				image: uploadedImageUrl || values.image || undefined,
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

	const handleImageUploaded = (url: string, key: string) => {
		setUploadedImageUrl(url);
		setUploadedImageKey(key);
		form.setValue("image", url);
		setImagePreview(url);
		setImageError(false);
	};

	const handleImageRemoved = () => {
		setUploadedImageUrl(undefined);
		setUploadedImageKey(undefined);
		form.setValue("image", undefined);
		setImagePreview("");
	};

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

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<Button
					variant="outline"
					size="icon"
					onClick={handleCancel}
					disabled={isLoading}
				>
					<ArrowLeft className="w-4 h-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">Editar Perfil</h1>
					<p className="text-muted-foreground">
						Actualiza tu información personal
					</p>
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
											<ImageUpload
												onImageUploaded={handleImageUploaded}
												onImageRemoved={handleImageRemoved}
												currentImageUrl={uploadedImageUrl}
												currentImageKey={uploadedImageKey}
												type="user-avatar"
												label="Foto de Perfil"
												description="Sube una imagen para tu perfil. Formatos permitidos: JPEG, PNG, WebP. Máximo 2MB."
												disabled={isLoading}
												className="w-full"
											/>
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
											<Input
												placeholder="Tu nombre completo"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormDescription>
											Este nombre se mostrará en tu perfil público
										</FormDescription>
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
										<span className="text-muted-foreground">Email:</span>{" "}
										<span>{data?.user.email}</span>
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
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									disabled={isLoading}
								>
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
