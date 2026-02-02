import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "../config";
import { product, productCategory } from "../schema";
import { shop, shopCategoryRelation } from "../schema/shop-schema";

export interface SearchProductsParams {
	query?: string;
	shopId?: number;
	categoryId?: number;
	minPrice?: number;
	maxPrice?: number;
	isFeatured?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: "relevance" | "price_asc" | "price_desc" | "name" | "newest";
}

export interface SearchResult {
	products: SearchProductResult[];
	total: number;
	hasMore: boolean;
}

export interface SearchProductResult {
	id: number;
	name: string;
	description: string | null;
	price: string;
	images: string[] | null;
	shopId: number;
	shopName: string;
	shopLogo: string | null;
	categoryId: number | null;
	categoryName: string | null;
	isFeatured: boolean | null;
	tags: string[] | null;
}

/**
 * Search products with filters and pagination
 */
export const searchProducts = async (
	params: SearchProductsParams,
): Promise<SearchResult> => {
	const {
		query,
		shopId,
		categoryId,
		minPrice,
		maxPrice,
		isFeatured,
		limit = 20,
		offset = 0,
		sortBy = "relevance",
	} = params;

	// Build conditions array
	const conditions = [];

	// Only show active products
	conditions.push(eq(product.isActive, true));

	// Text search (name, description, tags)
	if (query && query.trim().length > 0) {
		const searchTerm = `%${query.trim()}%`;
		conditions.push(
			or(
				ilike(product.name, searchTerm),
				ilike(product.description, searchTerm),
				sql`array_to_string(${product.tags}, ' ') ILIKE ${searchTerm}`,
			),
		);
	}

	// Shop filter
	if (shopId) {
		conditions.push(eq(product.shopId, shopId));
	}

	// Category filter
	if (categoryId) {
		conditions.push(eq(product.categoryId, categoryId));
	}

	// Price range
	if (minPrice !== undefined) {
		conditions.push(gte(sql`CAST(${product.price} AS DECIMAL)`, minPrice));
	}
	if (maxPrice !== undefined) {
		conditions.push(lte(sql`CAST(${product.price} AS DECIMAL)`, maxPrice));
	}

	// Featured filter
	if (isFeatured !== undefined) {
		conditions.push(eq(product.isFeatured, isFeatured));
	}

	// Determine sort order
	let orderBy: ReturnType<typeof asc> | ReturnType<typeof asc>[];
	switch (sortBy) {
		case "price_asc":
			orderBy = asc(sql`CAST(${product.price} AS DECIMAL)`);
			break;
		case "price_desc":
			orderBy = desc(sql`CAST(${product.price} AS DECIMAL)`);
			break;
		case "name":
			orderBy = asc(product.name);
			break;
		case "newest":
			orderBy = desc(product.createdAt);
			break;
		case "relevance":
		default:
			// Featured first, then by name
			orderBy = [desc(product.isFeatured), asc(product.name)];
			break;
	}

	// Execute main query
	const results = await db
		.select({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			images: product.images,
			shopId: product.shopId,
			shopName: shop.name,
			shopLogo: shop.logo,
			categoryId: product.categoryId,
			categoryName: productCategory.name,
			isFeatured: product.isFeatured,
			tags: product.tags,
		})
		.from(product)
		.innerJoin(shop, eq(product.shopId, shop.id))
		.leftJoin(productCategory, eq(product.categoryId, productCategory.id))
		.where(and(...conditions))
		.orderBy(...(Array.isArray(orderBy) ? orderBy : [orderBy]))
		.limit(limit)
		.offset(offset);

	// Count total results
	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(product)
		.innerJoin(shop, eq(product.shopId, shop.id))
		.where(and(...conditions));

	const total = Number(countResult?.count || 0);

	return {
		products: results,
		total,
		hasMore: offset + results.length < total,
	};
};

/**
 * Get autocomplete suggestions based on search query
 */
export const getSearchSuggestions = async (
	query: string,
	limit = 5,
): Promise<string[]> => {
	if (!query || query.trim().length < 2) {
		return [];
	}

	const searchTerm = `%${query.trim()}%`;

	// Get product name suggestions
	const productSuggestions = await db
		.selectDistinct({ name: product.name })
		.from(product)
		.where(and(eq(product.isActive, true), ilike(product.name, searchTerm)))
		.limit(limit);

	return productSuggestions.map((p) => p.name);
};

/**
 * Search shops
 */
export interface SearchShopsParams {
	query?: string;
	categoryId?: number;
	limit?: number;
	offset?: number;
}

export interface SearchShopResult {
	id: number;
	name: string;
	description: string | null;
	logo: string | null;
	banner: string | null;
	address: string | null;
	tags: string[] | null;
}

export const searchShops = async (
	params: SearchShopsParams,
): Promise<{ shops: SearchShopResult[]; total: number; hasMore: boolean }> => {
	const { query, categoryId, limit = 10, offset = 0 } = params;

	const conditions = [];

	if (query && query.trim().length > 0) {
		const searchTerm = `%${query.trim()}%`;
		conditions.push(
			or(
				ilike(shop.name, searchTerm),
				ilike(shop.description, searchTerm),
				sql`array_to_string(${shop.tags}, ' ') ILIKE ${searchTerm}`,
			),
		);
	}

	if (categoryId) {
		const shopsWithCategory = await db
			.select({ shopId: shopCategoryRelation.shopId })
			.from(shopCategoryRelation)
			.where(eq(shopCategoryRelation.categoryId, categoryId));

		const shopIds = shopsWithCategory.map((s) => s.shopId);
		if (shopIds.length > 0) {
			conditions.push(sql`${shop.id} IN (${sql.join(shopIds, sql`, `)})`);
		} else {
			return { shops: [], total: 0, hasMore: false };
		}
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const results = await db
		.select({
			id: shop.id,
			name: shop.name,
			description: shop.description,
			logo: shop.logo,
			banner: shop.banner,
			address: shop.address,
			tags: shop.tags,
		})
		.from(shop)
		.where(whereClause)
		.orderBy(asc(shop.name))
		.limit(limit)
		.offset(offset);

	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(shop)
		.where(whereClause);

	const total = Number(countResult?.count || 0);

	return {
		shops: results,
		total,
		hasMore: offset + results.length < total,
	};
};

/**
 * Get product categories with product count
 */
export const getProductCategoriesWithCount = async (shopId?: number) => {
	const conditions = [eq(product.isActive, true)];

	if (shopId) {
		conditions.push(eq(product.shopId, shopId));
	}

	const categories = await db
		.select({
			id: productCategory.id,
			name: productCategory.name,
			count: sql<number>`count(${product.id})`,
		})
		.from(productCategory)
		.innerJoin(product, eq(product.categoryId, productCategory.id))
		.where(and(...conditions))
		.groupBy(productCategory.id, productCategory.name)
		.orderBy(asc(productCategory.name));

	return categories;
};

/**
 * Get popular/trending products
 */
export const getPopularProducts = async (
	shopId?: number,
	limit = 8,
): Promise<SearchProductResult[]> => {
	const conditions = [eq(product.isActive, true), eq(product.isFeatured, true)];

	if (shopId) {
		conditions.push(eq(product.shopId, shopId));
	}

	const results = await db
		.select({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			images: product.images,
			shopId: product.shopId,
			shopName: shop.name,
			shopLogo: shop.logo,
			categoryId: product.categoryId,
			categoryName: productCategory.name,
			isFeatured: product.isFeatured,
			tags: product.tags,
		})
		.from(product)
		.innerJoin(shop, eq(product.shopId, shop.id))
		.leftJoin(productCategory, eq(product.categoryId, productCategory.id))
		.where(and(...conditions))
		.orderBy(desc(product.isFeatured), desc(product.createdAt))
		.limit(limit);

	return results;
};
