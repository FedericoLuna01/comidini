import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { toast } from "@repo/ui/components/ui/sonner";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { uploadImage, validateImageFile } from "../api/upload";

interface ImageUploadProps {
	onImageUploaded: (url: string, key: string) => void;
	onImageRemoved?: () => void;
	currentImageUrl?: string;
	currentImageKey?: string;
	type: "user-avatar" | "shop-logo" | "product-image";
	label?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
	onImageUploaded,
	onImageRemoved,
	currentImageUrl,
	currentImageKey,
	type,
	label = "Imagen",
	description,
	disabled = false,
	className = "",
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		currentImageUrl || null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file
		const validation = validateImageFile(file);
		if (!validation.isValid) {
			toast.error(validation.error || "Error al validar el archivo");
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewUrl(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload file
		setIsUploading(true);
		try {
			const result = await uploadImage(file, type);
			onImageUploaded(result.data.url, result.data.key);
			toast.success("Imagen subida exitosamente");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error instanceof Error ? error.message : "Error al subir la imagen",
			);
			setPreviewUrl(currentImageUrl || null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = () => {
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onImageRemoved?.();
	};

	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div>
				<Label htmlFor="image-upload">{label}</Label>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>

			<div className="space-y-4">
				{/* Current Image Display */}
				{currentImageUrl && !previewUrl && (
					<div className="relative inline-block">
						<img
							src={currentImageUrl}
							// biome-ignore lint/a11y/noRedundantAlt: <asd>
							alt="Displayed Image"
							className="w-32 h-32 object-cover rounded-lg border"
						/>
						{!disabled && (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute -top-2 -right-2 h-6 w-6 p-0"
								onClick={handleRemoveImage}
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
				)}

				{/* Preview */}
				{previewUrl && (
					<div className="relative inline-block">
						<img
							src={previewUrl}
							alt="Preview"
							className="w-32 h-32 object-cover rounded-lg border"
						/>
						{!disabled && (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute -top-2 -right-2 h-6 w-6 p-0"
								onClick={handleRemoveImage}
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
				)}

				{/* Upload Button */}
				{!previewUrl && !currentImageUrl && (
					<div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
						<div className="text-center">
							<ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
							<p className="text-xs text-muted-foreground mt-1">Sin imagen</p>
						</div>
					</div>
				)}

				{/* File Input */}
				<Input
					ref={fileInputRef}
					id="image-upload"
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
					disabled={disabled || isUploading}
				/>

				{/* Upload Button */}
				<Button
					type="button"
					variant="outline"
					onClick={handleClickUpload}
					disabled={disabled || isUploading}
					className="w-full"
				>
					{isUploading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
							Subiendo...
						</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							{currentImageUrl || previewUrl
								? "Cambiar imagen"
								: "Subir imagen"}
						</>
					)}
				</Button>
			</div>
		</div>
	);
};
