import { z } from "zod";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Schema for upload response
export const uploadResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		url: z.string(),
		key: z.string(),
		size: z.number(),
		contentType: z.string(),
	}),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export type ImageType = "user-avatar" | "shop-logo" | "product-image";

// Upload image function
export const uploadImage = async (
	file: File,
	type: ImageType,
	entityId?: string,
	oldImage?: string,
): Promise<UploadResponse> => {
	const formData = new FormData();
	formData.append("image", file);
	formData.append("type", type);
	if (entityId) {
		formData.append("entityId", entityId);
	}
	if (oldImage) {
		formData.append("oldImage", oldImage);
	}

	const response = await fetch(`${API_BASE_URL}/upload/image`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Error al subir la imagen");
	}

	const data = await response.json();
	return uploadResponseSchema.parse(data);
};

// Delete image function
export const deleteImage = async (key: string): Promise<void> => {
	const response = await fetch(
		`${API_BASE_URL}/upload/image/${encodeURIComponent(key)}`,
		{
			method: "DELETE",
			credentials: "include",
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Error al eliminar la imagen");
	}
};

// Helper function to validate image file
export const validateImageFile = (
	file: File,
	maxSizeMB = 5,
): { isValid: boolean; error?: string } => {
	const maxSize = maxSizeMB * 1024 * 1024;

	if (file.size > maxSize) {
		return {
			isValid: false,
			error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`,
		};
	}

	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	if (!allowedTypes.includes(file.type)) {
		return {
			isValid: false,
			error:
				"Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP).",
		};
	}

	return { isValid: true };
};
