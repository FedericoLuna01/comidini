import type {
	CreateProductSchema,
	SelectProductWithCategory,
} from "@repo/db/src/types/product";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export async function createProduct(data: CreateProductSchema) {
	const response = await fetch(`${API_URL}/products`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	return response.json();
}

export async function getAllProductsByShopId(shopId: number | undefined) {
	if (!shopId) {
		return [];
	}

	const response = await fetch(`${API_URL}/products/shop/${shopId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error fetching products");
	}

	return response.json();
}

export const allProductsQueryOptions = (shopId: number | undefined) =>
	queryOptions<SelectProductWithCategory[]>({
		queryKey: ["get-all-products", shopId],
		queryFn: () => getAllProductsByShopId(shopId),
	});
