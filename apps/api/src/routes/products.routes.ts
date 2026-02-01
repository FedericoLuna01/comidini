import {
	createModifierGroupWithOptions,
	createModifierOption,
	deleteModifierGroup,
	deleteModifierOption,
	getModifierGroupById,
	getModifierGroupsByProductId,
	updateModifierGroup,
	updateModifierOption,
} from "@repo/db/src/services/modifiers";
import {
	createProduct,
	createProductWithModifiers,
	deleteProductById,
	getAllProductsByShopId,
	getProductById,
	getProductByIdWithModifiers,
	updateProduct,
} from "@repo/db/src/services/products";
import {
	createModifierGroupWithOptionsSchema,
	createProductSchema,
	createProductWithModifiersSchema,
	insertModifierOptionSchema,
	updateProductSchema,
} from "@repo/db/src/types/product";
import { Router } from "express";
import { requireShop } from "../middlewares/requireShop";
import { requireShopUser } from "../middlewares/requireShopUser";

const router: Router = Router();

router.post("/", requireShopUser, requireShop, async (req, res) => {
	if (!req.shop) {
		res.status(400).json({ error: "Shop not found" });
		return;
	}

	const body = req.body;

	const validatedFields = createProductSchema.safeParse(body);

	if (!validatedFields.success) {
		console.error("Validation errors:", validatedFields.error);
		res
			.status(400)
			.json({ error: "Invalid product data", details: validatedFields.error });
		return;
	}

	const newProduct = {
		...validatedFields.data,
		shopId: req.shop.id,
	};

	const product = await createProduct(newProduct);

	if (!product) {
		res.status(500).json({ error: "Failed to create product" });
		return;
	}

	res.status(201).json(product);
});

router.get("/shop/:shopId", async (req, res) => {
	const products = await getAllProductsByShopId(Number(req.params.shopId));
	res.status(200).json(products);
});

router.get("/:productId", requireShopUser, requireShop, async (req, res) => {
	if (!req.shop) {
		res.status(400).json({ error: "Shop not found" });
		return;
	}

	const productId = req.params.productId;

	if (!productId) {
		res.status(400).json({ error: "Product ID is required" });
		return;
	}

	const product = await getProductById(Number(productId));

	if (!product) {
		res.status(404).json({ error: "Product not found" });
		return;
	}

	res.status(200).json(product);
});

router.put("/:productId", requireShopUser, requireShop, async (req, res) => {
	if (!req.shop) {
		res.status(400).json({ error: "Shop not found" });
		return;
	}

	const productId = req.params.productId;

	if (!productId) {
		res.status(400).json({ error: "Product ID is required" });
		return;
	}

	const body = req.body;

	const validatedFields = updateProductSchema.safeParse(body);

	if (!validatedFields.success) {
		console.error("Validation errors:", validatedFields.error);
		res
			.status(400)
			.json({ error: "Invalid product data", details: validatedFields.error });
		return;
	}

	const updatedProduct = await updateProduct(
		Number(productId),
		validatedFields.data,
	);

	if (!updatedProduct) {
		res.status(500).json({ error: "Failed to update product" });
		return;
	}

	res.status(200).json(updatedProduct);
});

router.delete("/:productId", requireShopUser, requireShop, async (req, res) => {
	if (!req.shop) {
		res.status(400).json({ error: "Shop not found" });
		return;
	}

	const productId = req.params.productId;

	if (!productId) {
		res.status(400).json({ error: "Product ID is required" });
		return;
	}

	await deleteProductById(Number(productId));
	res.status(204).send();
});

// ============================================================
// PRODUCT WITH MODIFIERS ENDPOINTS
// ============================================================

/**
 * Create a product with modifier groups and options
 * POST /products/with-modifiers
 */
router.post(
	"/with-modifiers",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const validatedFields = createProductWithModifiersSchema.safeParse(
			req.body,
		);

		if (!validatedFields.success) {
			console.error("Validation errors:", validatedFields.error);
			res.status(400).json({
				error: "Invalid product data",
				details: validatedFields.error,
			});
			return;
		}

		const productWithModifiers = await createProductWithModifiers({
			...validatedFields.data,
			shopId: req.shop.id,
		});

		if (!productWithModifiers) {
			res
				.status(500)
				.json({ error: "Failed to create product with modifiers" });
			return;
		}

		res.status(201).json(productWithModifiers);
	},
);

/**
 * Get product with full modifier hierarchy
 * GET /products/:productId/with-modifiers
 */
router.get("/:productId/with-modifiers", async (req, res) => {
	const productId = req.params.productId;

	if (!productId) {
		res.status(400).json({ error: "Product ID is required" });
		return;
	}

	const product = await getProductByIdWithModifiers(Number(productId));

	if (!product) {
		res.status(404).json({ error: "Product not found" });
		return;
	}

	res.status(200).json(product);
});

// ============================================================
// MODIFIER GROUP ENDPOINTS
// ============================================================

/**
 * Get all modifier groups for a product
 * GET /products/:productId/modifier-groups
 */
router.get("/:productId/modifier-groups", async (req, res) => {
	const productId = req.params.productId;

	if (!productId) {
		res.status(400).json({ error: "Product ID is required" });
		return;
	}

	const groups = await getModifierGroupsByProductId(Number(productId));
	res.status(200).json(groups);
});

/**
 * Create a modifier group for a product
 * POST /products/:productId/modifier-groups
 */
router.post(
	"/:productId/modifier-groups",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const productId = req.params.productId;

		if (!productId) {
			res.status(400).json({ error: "Product ID is required" });
			return;
		}

		const validatedFields = createModifierGroupWithOptionsSchema.safeParse(
			req.body,
		);

		if (!validatedFields.success) {
			console.error("Validation errors:", validatedFields.error);
			res.status(400).json({
				error: "Invalid modifier group data",
				details: validatedFields.error,
			});
			return;
		}

		const group = await createModifierGroupWithOptions(
			Number(productId),
			validatedFields.data,
		);

		if (!group) {
			res.status(500).json({ error: "Failed to create modifier group" });
			return;
		}

		res.status(201).json(group);
	},
);

/**
 * Get a modifier group by ID
 * GET /products/modifier-groups/:groupId
 */
router.get("/modifier-groups/:groupId", async (req, res) => {
	const groupId = req.params.groupId;

	if (!groupId) {
		res.status(400).json({ error: "Group ID is required" });
		return;
	}

	const group = await getModifierGroupById(Number(groupId));

	if (!group) {
		res.status(404).json({ error: "Modifier group not found" });
		return;
	}

	res.status(200).json(group);
});

/**
 * Update a modifier group
 * PUT /products/modifier-groups/:groupId
 */
router.put(
	"/modifier-groups/:groupId",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const groupId = req.params.groupId;

		if (!groupId) {
			res.status(400).json({ error: "Group ID is required" });
			return;
		}

		const updated = await updateModifierGroup(Number(groupId), req.body);

		if (!updated) {
			res.status(500).json({ error: "Failed to update modifier group" });
			return;
		}

		res.status(200).json(updated);
	},
);

/**
 * Delete a modifier group
 * DELETE /products/modifier-groups/:groupId
 */
router.delete(
	"/modifier-groups/:groupId",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const groupId = req.params.groupId;

		if (!groupId) {
			res.status(400).json({ error: "Group ID is required" });
			return;
		}

		await deleteModifierGroup(Number(groupId));
		res.status(204).send();
	},
);

// ============================================================
// MODIFIER OPTION ENDPOINTS
// ============================================================

/**
 * Create a modifier option for a group
 * POST /products/modifier-groups/:groupId/options
 */
router.post(
	"/modifier-groups/:groupId/options",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const groupId = req.params.groupId;

		if (!groupId) {
			res.status(400).json({ error: "Group ID is required" });
			return;
		}

		const validatedFields = insertModifierOptionSchema.safeParse(req.body);

		if (!validatedFields.success) {
			console.error("Validation errors:", validatedFields.error);
			res.status(400).json({
				error: "Invalid modifier option data",
				details: validatedFields.error,
			});
			return;
		}

		const option = await createModifierOption(
			Number(groupId),
			validatedFields.data,
		);

		if (!option) {
			res.status(500).json({ error: "Failed to create modifier option" });
			return;
		}

		res.status(201).json(option);
	},
);

/**
 * Update a modifier option
 * PUT /products/modifier-options/:optionId
 */
router.put(
	"/modifier-options/:optionId",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const optionId = req.params.optionId;

		if (!optionId) {
			res.status(400).json({ error: "Option ID is required" });
			return;
		}

		const updated = await updateModifierOption(Number(optionId), req.body);

		if (!updated) {
			res.status(500).json({ error: "Failed to update modifier option" });
			return;
		}

		res.status(200).json(updated);
	},
);

/**
 * Delete a modifier option
 * DELETE /products/modifier-options/:optionId
 */
router.delete(
	"/modifier-options/:optionId",
	requireShopUser,
	requireShop,
	async (req, res) => {
		if (!req.shop) {
			res.status(400).json({ error: "Shop not found" });
			return;
		}

		const optionId = req.params.optionId;

		if (!optionId) {
			res.status(400).json({ error: "Option ID is required" });
			return;
		}

		await deleteModifierOption(Number(optionId));
		res.status(204).send();
	},
);

export default router;
