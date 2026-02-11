import {
	createProductCategory,
	deleteProductCategory,
	getProductCategoriesByShopId,
	getProductCategoryById,
	getProductCountByCategory,
	reorderProductCategories,
	updateProductCategory,
} from "@repo/db/src/services/category";
import { reorderProducts } from "@repo/db/src/services/products";
import {
	createManyShopHours,
	createShop,
	getAllShops,
	getAllShopsHours,
	getShopById,
	getShopByUserId,
	getShopHoursByShopId,
	updateShop,
	updateShopHours,
} from "@repo/db/src/services/shops";
import {
	createProductCategorySchema,
	reorderItemsSchema,
	updateProductCategorySchema,
} from "@repo/db/src/types/product";
import {
	type CreateShopHours,
	createShopHoursSchema,
	createShopSchema,
	updateShopSchema,
} from "@repo/db/src/types/shop";
import { type Request, type Response, Router } from "express";
import { z } from "zod/v4";
import { requireShop } from "../middlewares/requireShop";
import { requireShopUser } from "../middlewares/requireShopUser";

const router: Router = Router();

// Rutas estáticas - deben ir ANTES de las rutas dinámicas
router.get("/", async (_req: Request, res: Response): Promise<void> => {
	try {
		const shops = await getAllShops();
		res.json(shops);
	} catch (error) {
		console.error("Error shops route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Endpoint público para obtener todos los horarios de todas las tiendas
router.get(
	"/all-hours",
	async (_req: Request, res: Response): Promise<void> => {
		try {
			const hours = await getAllShopsHours();
			res.json(hours);
		} catch (error) {
			console.error("Error in /all-hours route:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.get(
	"/status",
	requireShopUser,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const session = req.session;

			if (!session || !session.user) {
				res.status(401).json({ error: "No autorizado" });
				return;
			}

			const shop = await getShopByUserId(session.user.id);

			res.json({ shop });
		} catch (error) {
			console.error("Error in /status route:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.get(
	"/hours",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const hours = await getShopHoursByShopId(req.shop.id);

			if (!hours || hours.length === 0) {
				res
					.status(404)
					.json({ error: "No se encontraron horarios para esta tienda" });
				return;
			}

			res.json(hours);
		} catch (error) {
			console.error("Error in /hours route:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.put(
	"/hours",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const newHoursData = req.body;

			const validatedFields = z
				.array(createShopHoursSchema)
				.safeParse(newHoursData);

			if (!validatedFields.success) {
				console.error("Validation errors:", validatedFields.error);
				res.status(400).json({
					error: "Datos de horarios inválidos",
					details: validatedFields.error,
				});
				return;
			}

			if (
				!Array.isArray(validatedFields.data) ||
				validatedFields.data.length === 0
			) {
				res.status(400).json({ error: "Datos de horarios inválidos" });
				return;
			}

			const updatedHours = await updateShopHours(
				req.shop.id,
				validatedFields.data,
			);

			res.json(updatedHours);
		} catch (error) {
			console.error("Error updating shop hours:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.post(
	"/",
	requireShopUser,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const session = req.session;

			if (!session || !session.user) {
				res.status(401).json({ error: "No autorizado" });
				return;
			}

			const shop = await getShopByUserId(session.user.id);

			if (shop) {
				res.status(400).json({ error: "Ya tienes una tienda creada" });
				return;
			}

			const userId = session.user.id;
			const shopData = req.body;

			const businessHours: CreateShopHours[] = shopData.businessHours || [];

			// Validar los datos de la tienda usando el esquema de base de datos
			const validatedFields = createShopSchema.safeParse({
				...shopData,
				userId,
			});

			if (!validatedFields.success) {
				console.error("Validation errors:", validatedFields.error);
				res.status(400).json({
					error: "Datos de tienda inválidos",
					details: validatedFields.error,
				});
				return;
			}

			const createdShop = await createShop({
				...validatedFields.data,
				userId,
			});

			if (!createdShop) {
				res.status(500).json({ error: "Error al crear la tienda" });
				return;
			}

			const shopHoursValues = businessHours.map((hours) => ({
				shopId: createdShop.id,
				...hours,
			}));

			if (shopHoursValues.length > 0) {
				await createManyShopHours(shopHoursValues);
			}

			res.status(201).json({ message: "Tienda creada exitosamente" });
		} catch (error) {
			console.error("Error al crear tienda:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// Rutas dinámicas - deben ir DESPUÉS de las rutas estáticas
router.get("/:shopId", async (req: Request, res: Response): Promise<void> => {
	try {
		const shopId = Number(req.params.shopId);

		if (Number.isNaN(shopId)) {
			res.status(400).json({ error: "ID de tienda inválido" });
			return;
		}

		const shop = await getShopById(shopId);

		if (!shop) {
			res.status(404).json({ error: "Tienda no encontrada" });
			return;
		}

		res.json(shop);
	} catch (error) {
		console.error("Error shops route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Endpoint público para obtener horarios de una tienda por ID
router.get(
	"/:shopId/hours",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const shopId = Number(req.params.shopId);

			if (Number.isNaN(shopId)) {
				res.status(400).json({ error: "ID de tienda inválido" });
				return;
			}

			const hours = await getShopHoursByShopId(shopId);

			res.json(hours || []);
		} catch (error) {
			console.error("Error in /:shopId/hours route:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.put(
	"/:shopId",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const shopData = req.body;

			const validatedFields = updateShopSchema.safeParse(shopData);

			if (!validatedFields.success) {
				console.error("Validation errors:", validatedFields.error);
				res.status(400).json({
					error: "Datos de tienda inválidos",
					details: validatedFields.error,
				});
				return;
			}

			const updatedShop = await updateShop(req.shop.id, validatedFields.data);

			if (!updatedShop) {
				res.status(500).json({ error: "Error al actualizar la tienda" });
				return;
			}

			res.json({
				message: "Tienda actualizada exitosamente",
				shop: updatedShop,
			});
		} catch (error) {
			console.error("Error al actualizar tienda:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.get(
	"/:shopId/category",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const categories = await getProductCategoriesByShopId(req.shop.id);

			res.json(categories);
		} catch (error) {
			console.error("Error in /:shopId/category route:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

router.post(
	"/:shopId/category",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const productCategory = req.body;

			// Aquí deberías validar los datos de la categoría según tu esquema
			const validatedFields =
				createProductCategorySchema.safeParse(productCategory);
			if (!validatedFields.success) {
				res.status(400).json({
					error: "Datos de categoría inválidos",
					details: validatedFields.error,
				});
				return;
			}

			// Implementa la lógica para crear la categoría aquí
			const createdCategory = await createProductCategory({
				...validatedFields.data,
				shopId: Number(req.shop.id),
			});

			res.status(201).json({
				message: "Categoría creada exitosamente",
				category: createdCategory,
			});
		} catch (error) {
			console.error("Error creating category:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// Update a category
router.patch(
	"/:shopId/category/:categoryId",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const categoryId = Number(req.params.categoryId);

			if (Number.isNaN(categoryId)) {
				res.status(400).json({ error: "ID de categoría inválido" });
				return;
			}

			// Verify the category belongs to this shop
			const existingCategory = await getProductCategoryById(categoryId);

			if (!existingCategory) {
				res.status(404).json({ error: "Categoría no encontrada" });
				return;
			}

			if (existingCategory.shopId !== req.shop.id) {
				res.status(403).json({ error: "No autorizado" });
				return;
			}

			const validatedFields = updateProductCategorySchema.safeParse(req.body);

			if (!validatedFields.success) {
				res.status(400).json({
					error: "Datos de categoría inválidos",
					details: validatedFields.error,
				});
				return;
			}

			const updatedCategory = await updateProductCategory(
				categoryId,
				validatedFields.data,
			);

			res.json({
				message: "Categoría actualizada exitosamente",
				category: updatedCategory,
			});
		} catch (error) {
			console.error("Error updating category:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// Delete a category
router.delete(
	"/:shopId/category/:categoryId",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const categoryId = Number(req.params.categoryId);

			if (Number.isNaN(categoryId)) {
				res.status(400).json({ error: "ID de categoría inválido" });
				return;
			}

			// Verify the category belongs to this shop
			const existingCategory = await getProductCategoryById(categoryId);

			if (!existingCategory) {
				res.status(404).json({ error: "Categoría no encontrada" });
				return;
			}

			if (existingCategory.shopId !== req.shop.id) {
				res.status(403).json({ error: "No autorizado" });
				return;
			}

			// Get product count
			const productCount = await getProductCountByCategory(categoryId);

			const deletedCategory = await deleteProductCategory(categoryId);

			res.json({
				message: "Categoría eliminada exitosamente",
				category: deletedCategory,
				productsAffected: productCount,
			});
		} catch (error) {
			console.error("Error deleting category:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// Reorder categories
router.patch(
	"/:shopId/categories/reorder",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const validatedFields = reorderItemsSchema.safeParse(req.body);

			if (!validatedFields.success) {
				res.status(400).json({
					error: "Datos de ordenamiento inválidos",
					details: validatedFields.error,
				});
				return;
			}

			const reorderedCategories = await reorderProductCategories(
				req.shop.id,
				validatedFields.data,
			);

			res.json({
				message: "Categorías reordenadas exitosamente",
				categories: reorderedCategories,
			});
		} catch (error) {
			console.error("Error reordering categories:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// Reorder products
router.patch(
	"/:shopId/products/reorder",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const validatedFields = reorderItemsSchema.safeParse(req.body);

			if (!validatedFields.success) {
				res.status(400).json({
					error: "Datos de ordenamiento inválidos",
					details: validatedFields.error,
				});
				return;
			}

			const reorderedProducts = await reorderProducts(
				req.shop.id,
				validatedFields.data,
			);

			res.json({
				message: "Productos reordenados exitosamente",
				products: reorderedProducts,
			});
		} catch (error) {
			console.error("Error reordering products:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

export default router;
