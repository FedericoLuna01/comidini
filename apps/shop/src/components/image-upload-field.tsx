import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import {
	AlertCircleIcon,
	ImageIcon,
	Loader2Icon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
	type ImageType,
	type UploadResponse,
	uploadImage,
	validateImageFile,
} from "../api/upload";
import { type FileWithPreview, useFileUpload } from "../hooks/use-file-upload";

export interface UploadedImageData {
	url: string;
	key: string;
	file?: File;
}

interface ImageUploadFieldProps {
	/**
	 * Tipo de imagen para configuración del servidor
	 */
	type: ImageType;
	/**
	 * Callback cuando las imágenes cambian (tanto locales como subidas)
	 */
	onImagesChange: (images: UploadedImageData[]) => void;
	/**
	 * Imágenes ya subidas (URLs)
	 */
	initialImages?: UploadedImageData[];
	/**
	 * Permitir múltiples archivos
	 */
	multiple?: boolean;
	/**
	 * Máximo número de archivos (solo aplica si multiple=true)
	 */
	maxFiles?: number;
	/**
	 * Tamaño máximo en MB
	 */
	maxSizeMB?: number;
	/**
	 * Deshabilitado
	 */
	disabled?: boolean;
	/**
	 * ID de entidad (para reemplazo de imágenes existentes)
	 */
	entityId?: string;
	/**
	 * Subir automáticamente al seleccionar archivo
	 */
	autoUpload?: boolean;
}

interface UploadingFile {
	id: string;
	file: File;
	preview: string;
	progress: "pending" | "uploading" | "done" | "error";
	result?: UploadResponse["data"];
	error?: string;
}

export const ImageUploadField = ({
	type,
	onImagesChange,
	initialImages = [],
	multiple = true,
	maxFiles = 6,
	maxSizeMB = 5,
	disabled = false,
	entityId,
	autoUpload = true,
}: ImageUploadFieldProps) => {
	const maxSize = maxSizeMB * 1024 * 1024;

	// Estado de archivos que se están subiendo
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	// Imágenes ya subidas exitosamente
	const [uploadedImages, setUploadedImages] =
		useState<UploadedImageData[]>(initialImages);

	const totalImages = uploadedImages.length + uploadingFiles.length;

	const handleFilesAdded = useCallback(
		async (addedFiles: FileWithPreview[]) => {
			if (disabled) return;

			// Filtrar archivos que excedan el límite
			const availableSlots = maxFiles - totalImages;
			const filesToProcess = addedFiles.slice(0, availableSlots);

			if (filesToProcess.length < addedFiles.length) {
				toast.warning(`Solo puedes subir ${maxFiles} imágenes en total`);
			}

			// Validar archivos
			const validFiles: UploadingFile[] = [];
			for (const fileWithPreview of filesToProcess) {
				if (!(fileWithPreview.file instanceof File)) continue;

				const validation = validateImageFile(fileWithPreview.file, maxSizeMB);
				if (!validation.isValid) {
					toast.error(validation.error);
					continue;
				}

				validFiles.push({
					id: fileWithPreview.id,
					file: fileWithPreview.file,
					preview: fileWithPreview.preview || "",
					progress: "pending",
				});
			}

			if (validFiles.length === 0) return;

			// Agregar a la lista de uploading
			setUploadingFiles((prev) => [...prev, ...validFiles]);

			if (autoUpload) {
				// Subir cada archivo
				for (const uploadingFile of validFiles) {
					setUploadingFiles((prev) =>
						prev.map((f) =>
							f.id === uploadingFile.id ? { ...f, progress: "uploading" } : f,
						),
					);

					try {
						const result = await uploadImage(
							uploadingFile.file,
							type,
							entityId,
						);

						// Marcar como completado
						setUploadingFiles((prev) =>
							prev.filter((f) => f.id !== uploadingFile.id),
						);

						// Agregar a imágenes subidas
						setUploadedImages((prev) => {
							const newImages = [
								...prev,
								{ url: result.data.url, key: result.data.key },
							];
							onImagesChange(newImages);
							return newImages;
						});
					} catch (error) {
						console.error("Error uploading file:", error);
						setUploadingFiles((prev) =>
							prev.map((f) =>
								f.id === uploadingFile.id
									? {
											...f,
											progress: "error",
											error:
												error instanceof Error
													? error.message
													: "Error al subir",
										}
									: f,
							),
						);
						toast.error(
							error instanceof Error ? error.message : "Error al subir imagen",
						);
					}
				}
			}
		},
		[
			disabled,
			maxFiles,
			totalImages,
			maxSizeMB,
			autoUpload,
			type,
			entityId,
			onImagesChange,
		],
	);

	const [
		{ isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
		},
	] = useFileUpload({
		accept: "image/png,image/jpeg,image/jpg,image/webp",
		maxSize,
		multiple,
		maxFiles: maxFiles - uploadedImages.length,
		onFilesAdded: handleFilesAdded,
	});

	const removeUploadedImage = useCallback(
		(imageToRemove: UploadedImageData) => {
			setUploadedImages((prev) => {
				const newImages = prev.filter((img) => img.url !== imageToRemove.url);
				onImagesChange(newImages);
				return newImages;
			});
		},
		[onImagesChange],
	);

	const removeUploadingFile = useCallback((id: string) => {
		setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
	}, []);

	const retryUpload = useCallback(
		async (uploadingFile: UploadingFile) => {
			setUploadingFiles((prev) =>
				prev.map((f) =>
					f.id === uploadingFile.id
						? { ...f, progress: "uploading", error: undefined }
						: f,
				),
			);

			try {
				const result = await uploadImage(uploadingFile.file, type, entityId);

				setUploadingFiles((prev) =>
					prev.filter((f) => f.id !== uploadingFile.id),
				);

				setUploadedImages((prev) => {
					const newImages = [
						...prev,
						{ url: result.data.url, key: result.data.key },
					];
					onImagesChange(newImages);
					return newImages;
				});
			} catch (error) {
				setUploadingFiles((prev) =>
					prev.map((f) =>
						f.id === uploadingFile.id
							? {
									...f,
									progress: "error",
									error:
										error instanceof Error ? error.message : "Error al subir",
								}
							: f,
					),
				);
			}
		},
		[type, entityId, onImagesChange],
	);

	const hasImages = uploadedImages.length > 0 || uploadingFiles.length > 0;
	const canAddMore = totalImages < maxFiles;

	return (
		<div className="flex flex-col gap-2">
			{/* Drop area */}
			{/** biome-ignore lint/a11y/noStaticElementInteractions: drag and drop */}
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				data-dragging={isDragging || undefined}
				data-files={hasImages || undefined}
				data-disabled={disabled || undefined}
				className="border-input data-[dragging=true]:bg-accent/50 data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
			>
				<input
					{...getInputProps()}
					className="sr-only"
					aria-label="Subir imagen"
					disabled={disabled}
				/>

				{hasImages ? (
					<div className="flex w-full flex-col gap-3">
						<div className="flex items-center justify-between gap-2">
							<h3 className="truncate text-sm font-medium">
								Imágenes ({totalImages}/{maxFiles})
							</h3>
							{canAddMore && (
								<Button
									variant="outline"
									size="sm"
									onClick={openFileDialog}
									disabled={disabled}
									type="button"
								>
									<UploadIcon
										className="-ms-0.5 size-3.5 opacity-60"
										aria-hidden="true"
									/>
									Agregar más
								</Button>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
							{/* Imágenes ya subidas */}
							{uploadedImages.map((image) => (
								<div
									key={image.url}
									className="bg-accent relative aspect-square rounded-md"
								>
									<img
										src={image.url}
										alt="Imagen del producto"
										className="size-full rounded-[inherit] object-cover"
									/>
									{!disabled && (
										<Button
											onClick={() => removeUploadedImage(image)}
											size="icon"
											className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
											aria-label="Eliminar imagen"
											type="button"
										>
											<XIcon className="size-3.5" />
										</Button>
									)}
								</div>
							))}

							{/* Archivos subiendo */}
							{uploadingFiles.map((uploadingFile) => (
								<div
									key={uploadingFile.id}
									className="bg-accent relative aspect-square rounded-md"
								>
									<img
										src={uploadingFile.preview}
										alt="Subiendo..."
										className="size-full rounded-[inherit] object-cover opacity-50"
									/>

									{/* Overlay de estado */}
									<div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-[inherit]">
										{uploadingFile.progress === "uploading" && (
											<Loader2Icon className="size-6 text-white animate-spin" />
										)}
										{uploadingFile.progress === "error" && (
											<div className="flex flex-col items-center gap-1">
												<AlertCircleIcon className="size-6 text-red-400" />
												<Button
													size="sm"
													variant="secondary"
													onClick={() => retryUpload(uploadingFile)}
													type="button"
												>
													Reintentar
												</Button>
											</div>
										)}
									</div>

									{!disabled && (
										<Button
											onClick={() => removeUploadingFile(uploadingFile.id)}
											size="icon"
											variant="destructive"
											className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
											aria-label="Cancelar"
											type="button"
										>
											<XIcon className="size-3.5" />
										</Button>
									)}
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center px-4 py-3 text-center">
						<div
							className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
							aria-hidden="true"
						>
							<ImageIcon className="size-4 opacity-60" />
						</div>
						<p className="mb-1.5 text-sm font-medium">
							Arrastra y suelta imágenes aquí
						</p>
						<p className="text-muted-foreground text-xs">
							PNG, JPG o WEBP (máx. {maxSizeMB}MB)
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={openFileDialog}
							type="button"
							disabled={disabled}
						>
							<UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
							Seleccionar imágenes
						</Button>
					</div>
				)}
			</div>

			{errors.length > 0 && (
				<div
					className="text-destructive flex items-center gap-1 text-xs"
					role="alert"
				>
					<AlertCircleIcon className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</div>
			)}
		</div>
	);
};
