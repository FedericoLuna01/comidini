export interface ImageUploadResult {
	url: string;
	key: string;
	size: number;
	contentType: string;
}

export interface ImageUploadOptions {
	folder?: string;
	maxSize?: number; // in bytes
	allowedTypes?: string[];
	resize?: {
		width?: number;
		height?: number;
		quality?: number;
	};
}

export interface ImageMetadata {
	width: number;
	height: number;
	size: number;
	format: string;
	contentType: string;
}

export type ImageType =
	| "user-avatar"
	| "shop-logo"
	| "product-image"
	| "shop-banner";

export interface UploadedImage {
	url: string;
	key: string;
	metadata: ImageMetadata;
}
