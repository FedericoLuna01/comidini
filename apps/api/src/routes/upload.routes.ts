import { db, eq, product, shop, user } from "@repo/db";
import {
	deleteImage,
	getDefaultOptionsForType,
	r2Config,
	uploadImage,
} from "@repo/storage";
import { type Request, type Response, Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req: any, file: any, cb: any) => {
		// Check file type
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Only image files are allowed"));
		}
		cb(null, true);
	},
});

// Schema for upload request
const uploadSchema = z.object({
	type: z.enum(["user-avatar", "shop-logo", "product-image"]),
	entityId: z.string().optional(),
	oldImage: z.string().optional(),
});

// Helper to extract key from URL
const getKeyFromUrl = (url: string): string | null => {
	const publicUrl = r2Config.publicUrl;
	if (url.startsWith(publicUrl)) {
		let key = url.slice(publicUrl.length);
		if (key.startsWith("/")) key = key.slice(1);
		return key;
	}
	return null;
};

// Upload image endpoint
router.post(
	"/image",
	requireAuth,
	upload.single("image"),
	async (req: any, res: Response): Promise<void> => {
		try {
			// Validate request
			const { type, entityId, oldImage } = uploadSchema.parse(req.body);

			if (!req.file) {
				res.status(400).json({ error: "No image file provided" });
				return;
			}

			// Get default options for the image type
			const options = getDefaultOptionsForType(type);

			// Handle old image deletion based on type
			try {
				if (type === "user-avatar" && req.session?.user?.id) {
					const [currentUser] = await db
						.select({ image: user.image })
						.from(user)
						.where(eq(user.id, req.session.user.id))
						.limit(1);

					if (currentUser?.image) {
						const key = getKeyFromUrl(currentUser.image);
						if (key) {
							console.log(`Deleting old avatar: ${key}`);
							await deleteImage(key).catch(console.error);
						}
					}
				} else if (type === "shop-logo" && entityId) {
					const shopId = parseInt(entityId);
					if (!Number.isNaN(shopId)) {
						const [currentShop] = await db
							.select({ logo: shop.logo, userId: shop.userId })
							.from(shop)
							.where(eq(shop.id, shopId))
							.limit(1);

						// Verify ownership
						if (
							currentShop &&
							currentShop.userId === req.session?.user?.id &&
							currentShop.logo
						) {
							const key = getKeyFromUrl(currentShop.logo);
							if (key) {
								console.log(`Deleting old shop logo: ${key}`);
								await deleteImage(key).catch(console.error);
							}
						}
					}
				} else if (type === "product-image" && entityId && oldImage) {
					const productId = parseInt(entityId);
					if (!Number.isNaN(productId)) {
						// Join product with shop to verify ownership
						const [currentProduct] = await db
							.select({
								images: product.images,
								shopUserId: shop.userId,
							})
							.from(product)
							.innerJoin(shop, eq(product.shopId, shop.id))
							.where(eq(product.id, productId))
							.limit(1);

						// Verify ownership and that the image belongs to the product
						if (
							currentProduct &&
							currentProduct.shopUserId === req.session?.user?.id &&
							currentProduct.images &&
							currentProduct.images.includes(oldImage)
						) {
							const key = getKeyFromUrl(oldImage);
							if (key) {
								console.log(`Deleting old product image: ${key}`);
								await deleteImage(key).catch(console.error);
							}
						}
					}
				}
			} catch (error) {
				console.error("Error handling old image deletion:", error);
				// Continue with upload even if deletion fails
			}

			// Upload image to R2
			const result = await uploadImage(req.file.buffer, type, options);

			res.json({
				success: true,
				data: result,
			});
		} catch (error) {
			console.error("Upload error:", error);

			if (error instanceof z.ZodError) {
				res.status(400).json({ error: "Invalid request data" });
				return;
			}

			if (error instanceof Error) {
				res.status(400).json({ error: error.message });
				return;
			}

			res.status(500).json({ error: "Internal server error" });
		}
	},
);

// Delete image endpoint
router.delete(
	"/image/:key",
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { key } = req.params;

			if (!key) {
				res.status(400).json({ error: "Image key is required" });
				return;
			}

			await deleteImage(key);

			res.json({
				success: true,
				message: "Image deleted successfully",
			});
		} catch (error) {
			console.error("Delete error:", error);

			if (error instanceof Error) {
				res.status(400).json({ error: error.message });
				return;
			}

			res.status(500).json({ error: "Internal server error" });
		}
	},
);

export default router;
