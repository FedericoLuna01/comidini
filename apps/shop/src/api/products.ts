import type {
	CreateProductSchema,
	SelectProductWithCategory,
	UpdateProductSchema,
} from "@repo/db/src/types/product";
import { queryOptions, type UseMutationOptions } from "@tanstack/react-query";

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

export async function getProductById(productId: number) {
	const response = await fetch(`${API_URL}/products/${productId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error fetching product");
	}

	return response.json();
}

export async function updateProduct(
	productId: number,
	data: UpdateProductSchema,
) {
	const response = await fetch(`${API_URL}/products/${productId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Error updating product");
	}

	return response.json();
}

export const allProductsQueryOptions = (shopId: number | undefined) =>
	queryOptions<SelectProductWithCategory[]>({
		queryKey: ["get-all-products", shopId],
		queryFn: () => getAllProductsByShopId(shopId),
	});

export const productByIdQueryOptions = (productId: number) =>
	queryOptions<SelectProductWithCategory>({
		queryKey: ["get-product", productId],
		queryFn: () => getProductById(productId),
		enabled: !!productId,
	});

const deleteProductById = async (productId: number) => {
	const response = await fetch(`${API_URL}/products/${productId}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error deleting product");
	}
};

export const deleteProductMutationOptions = (
	productId: number,
): UseMutationOptions<void, Error, void> => ({
	mutationKey: ["delete-product", productId],
	mutationFn: () => deleteProductById(productId),
});
