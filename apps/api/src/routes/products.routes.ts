import {
	createProduct,
	deleteProductById,
	getAllProductsByShopId,
	getProductById,
	updateProduct,
} from "@repo/db/src/services/products";
import {
	createProductSchema,
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

router.get("/shop/:shopId", requireShopUser, requireShop, async (req, res) => {
	if (!req.shop) {
		res.status(400).json({ error: "Shop not found" });
		return;
	}

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

export default router;
