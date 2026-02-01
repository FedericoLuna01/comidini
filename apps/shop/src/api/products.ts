import type {
	CreateModifierGroupWithOptionsSchema,
	CreateProductSchema,
	CreateProductWithModifiersSchema,
	ModifierGroupWithOptions,
	ProductWithModifiers,
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

/**
 * Create a product with modifier groups and options
 */
export async function createProductWithModifiers(
	data: CreateProductWithModifiersSchema,
): Promise<ProductWithModifiers> {
	const response = await fetch(`${API_URL}/products/with-modifiers`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Error creating product with modifiers");
	}

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

/**
 * Get product with full modifier hierarchy
 */
export async function getProductWithModifiers(
	productId: number,
): Promise<ProductWithModifiers> {
	const response = await fetch(
		`${API_URL}/products/${productId}/with-modifiers`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Error fetching product with modifiers");
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

export const productWithModifiersQueryOptions = (productId: number) =>
	queryOptions<ProductWithModifiers>({
		queryKey: ["get-product-with-modifiers", productId],
		queryFn: () => getProductWithModifiers(productId),
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

// ============================================================
// MODIFIER GROUP API FUNCTIONS
// ============================================================

/**
 * Get all modifier groups for a product
 */
export async function getModifierGroupsByProductId(
	productId: number,
): Promise<ModifierGroupWithOptions[]> {
	const response = await fetch(
		`${API_URL}/products/${productId}/modifier-groups`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Error fetching modifier groups");
	}

	return response.json();
}

/**
 * Create a modifier group for a product
 */
export async function createModifierGroup(
	productId: number,
	data: CreateModifierGroupWithOptionsSchema,
): Promise<ModifierGroupWithOptions> {
	const response = await fetch(
		`${API_URL}/products/${productId}/modifier-groups`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("Error creating modifier group");
	}

	return response.json();
}

/**
 * Update a modifier group
 */
export async function updateModifierGroup(
	groupId: number,
	data: Partial<CreateModifierGroupWithOptionsSchema>,
): Promise<ModifierGroupWithOptions> {
	const response = await fetch(
		`${API_URL}/products/modifier-groups/${groupId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("Error updating modifier group");
	}

	return response.json();
}

/**
 * Delete a modifier group
 */
export async function deleteModifierGroup(groupId: number): Promise<void> {
	const response = await fetch(
		`${API_URL}/products/modifier-groups/${groupId}`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Error deleting modifier group");
	}
}

export const modifierGroupsQueryOptions = (productId: number) =>
	queryOptions<ModifierGroupWithOptions[]>({
		queryKey: ["get-modifier-groups", productId],
		queryFn: () => getModifierGroupsByProductId(productId),
		enabled: !!productId,
	});
