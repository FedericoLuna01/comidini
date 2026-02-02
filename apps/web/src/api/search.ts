import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Types
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

export interface SearchResult {
	products: SearchProductResult[];
	total: number;
	hasMore: boolean;
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

export interface ShopsSearchResult {
	shops: SearchShopResult[];
	total: number;
	hasMore: boolean;
}

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

export interface CategoryWithCount {
	id: number;
	name: string;
	count: number;
}

// API Functions
const searchProducts = async (
	params: SearchProductsParams,
): Promise<SearchResult> => {
	const searchParams = new URLSearchParams();

	if (params.query) searchParams.set("q", params.query);
	if (params.shopId) searchParams.set("shopId", params.shopId.toString());
	if (params.categoryId)
		searchParams.set("categoryId", params.categoryId.toString());
	if (params.minPrice !== undefined)
		searchParams.set("minPrice", params.minPrice.toString());
	if (params.maxPrice !== undefined)
		searchParams.set("maxPrice", params.maxPrice.toString());
	if (params.isFeatured !== undefined)
		searchParams.set("isFeatured", params.isFeatured.toString());
	if (params.limit) searchParams.set("limit", params.limit.toString());
	if (params.offset) searchParams.set("offset", params.offset.toString());
	if (params.sortBy) searchParams.set("sortBy", params.sortBy);

	const response = await fetch(
		`${API_URL}/search/products?${searchParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Error al buscar productos");
	}

	return response.json();
};

const searchShops = async (params: {
	query?: string;
	categoryId?: number;
	limit?: number;
	offset?: number;
}): Promise<ShopsSearchResult> => {
	const searchParams = new URLSearchParams();

	if (params.query) searchParams.set("q", params.query);
	if (params.categoryId)
		searchParams.set("categoryId", params.categoryId.toString());
	if (params.limit) searchParams.set("limit", params.limit.toString());
	if (params.offset) searchParams.set("offset", params.offset.toString());

	const response = await fetch(
		`${API_URL}/search/shops?${searchParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Error al buscar tiendas");
	}

	return response.json();
};

const getSearchSuggestions = async (
	query: string,
	limit = 5,
): Promise<string[]> => {
	if (!query || query.trim().length < 2) {
		return [];
	}

	const searchParams = new URLSearchParams();
	searchParams.set("q", query);
	searchParams.set("limit", limit.toString());

	const response = await fetch(
		`${API_URL}/search/suggestions?${searchParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Error al obtener sugerencias");
	}

	return response.json();
};

const getProductCategories = async (
	shopId?: number,
): Promise<CategoryWithCount[]> => {
	const searchParams = new URLSearchParams();
	if (shopId) searchParams.set("shopId", shopId.toString());

	const response = await fetch(
		`${API_URL}/search/categories?${searchParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Error al obtener categorías");
	}

	return response.json();
};

const getPopularProducts = async (
	shopId?: number,
	limit = 8,
): Promise<SearchProductResult[]> => {
	const searchParams = new URLSearchParams();
	if (shopId) searchParams.set("shopId", shopId.toString());
	searchParams.set("limit", limit.toString());

	const response = await fetch(
		`${API_URL}/search/popular?${searchParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		throw new Error("Error al obtener productos populares");
	}

	return response.json();
};

// Query Options
export const searchProductsQueryOptions = (params: SearchProductsParams) =>
	queryOptions({
		queryKey: ["search-products", params],
		queryFn: () => searchProducts(params),
		enabled: true,
		staleTime: 1000 * 60, // 1 minute
	});

export const searchShopsQueryOptions = (params: {
	query?: string;
	categoryId?: number;
	limit?: number;
	offset?: number;
}) =>
	queryOptions({
		queryKey: ["search-shops", params],
		queryFn: () => searchShops(params),
		enabled: true,
		staleTime: 1000 * 60,
	});

export const searchSuggestionsQueryOptions = (query: string) =>
	queryOptions({
		queryKey: ["search-suggestions", query],
		queryFn: () => getSearchSuggestions(query),
		enabled: query.length >= 2,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

export const productCategoriesQueryOptions = (shopId?: number) =>
	queryOptions({
		queryKey: ["product-categories", shopId],
		queryFn: () => getProductCategories(shopId),
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

export const popularProductsQueryOptions = (shopId?: number, limit = 8) =>
	queryOptions({
		queryKey: ["popular-products", shopId, limit],
		queryFn: () => getPopularProducts(shopId, limit),
		staleTime: 1000 * 60 * 5,
	});
