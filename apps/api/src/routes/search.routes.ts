import {
	getPopularProducts,
	getProductCategoriesWithCount,
	getSearchSuggestions,
	type SearchProductsParams,
	type SearchShopsParams,
	searchProducts,
	searchShops,
} from "@repo/db/src/services/search";
import { Router } from "express";

const router: Router = Router();

/**
 * GET /search/products
 * Search products with filters
 * Query params: q, shopId, categoryId, minPrice, maxPrice, isFeatured, limit, offset, sortBy
 */
router.get("/products", async (req, res) => {
	try {
		const {
			q,
			shopId,
			categoryId,
			minPrice,
			maxPrice,
			isFeatured,
			limit,
			offset,
			sortBy,
		} = req.query;

		const params: SearchProductsParams = {
			query: q as string | undefined,
			shopId: shopId ? Number(shopId) : undefined,
			categoryId: categoryId ? Number(categoryId) : undefined,
			minPrice: minPrice ? Number(minPrice) : undefined,
			maxPrice: maxPrice ? Number(maxPrice) : undefined,
			isFeatured:
				isFeatured === "true"
					? true
					: isFeatured === "false"
						? false
						: undefined,
			limit: limit ? Number(limit) : 20,
			offset: offset ? Number(offset) : 0,
			sortBy: sortBy as SearchProductsParams["sortBy"],
		};

		const results = await searchProducts(params);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error searching products:", error);
		res.status(500).json({ error: "Failed to search products" });
	}
});

/**
 * GET /search/shops
 * Search shops
 * Query params: q, categoryId, limit, offset
 */
router.get("/shops", async (req, res) => {
	try {
		const { q, categoryId, limit, offset } = req.query;

		const params: SearchShopsParams = {
			query: q as string | undefined,
			categoryId: categoryId ? Number(categoryId) : undefined,
			limit: limit ? Number(limit) : 10,
			offset: offset ? Number(offset) : 0,
		};

		const results = await searchShops(params);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error searching shops:", error);
		res.status(500).json({ error: "Failed to search shops" });
	}
});

/**
 * GET /search/suggestions
 * Get autocomplete suggestions
 * Query params: q, limit
 */
router.get("/suggestions", async (req, res) => {
	try {
		const { q, limit } = req.query;

		if (!q || typeof q !== "string" || q.trim().length < 2) {
			res.status(200).json([]);
			return;
		}

		const suggestions = await getSearchSuggestions(
			q,
			limit ? Number(limit) : 5,
		);
		res.status(200).json(suggestions);
	} catch (error) {
		console.error("Error getting suggestions:", error);
		res.status(500).json({ error: "Failed to get suggestions" });
	}
});

/**
 * GET /search/categories
 * Get product categories with count
 * Query params: shopId
 */
router.get("/categories", async (req, res) => {
	try {
		const { shopId } = req.query;

		const categories = await getProductCategoriesWithCount(
			shopId ? Number(shopId) : undefined,
		);
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error getting categories:", error);
		res.status(500).json({ error: "Failed to get categories" });
	}
});

/**
 * GET /search/popular
 * Get popular/featured products
 * Query params: shopId, limit
 */
router.get("/popular", async (req, res) => {
	try {
		const { shopId, limit } = req.query;

		const products = await getPopularProducts(
			shopId ? Number(shopId) : undefined,
			limit ? Number(limit) : 8,
		);
		res.status(200).json(products);
	} catch (error) {
		console.error("Error getting popular products:", error);
		res.status(500).json({ error: "Failed to get popular products" });
	}
});

export default router;
