export async function getProductCategoriesByShopId(shopId: number | undefined) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/shops/${shopId}/category`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			method: "GET",
			credentials: "include",
		},
	);

	if (!response.ok) throw new Error("Failed to fetch categories");

	return response.json();
}

export async function updateCategory(
	shopId: number,
	categoryId: number,
	data: { name?: string; isActive?: boolean; sortOrder?: number },
) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/shops/${shopId}/category/${categoryId}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			method: "PATCH",
			credentials: "include",
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) throw new Error("Failed to update category");

	return response.json();
}

export async function deleteCategory(shopId: number, categoryId: number) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/shops/${shopId}/category/${categoryId}`,
		{
			method: "DELETE",
			credentials: "include",
		},
	);

	if (!response.ok) throw new Error("Failed to delete category");

	return response.json();
}

export async function reorderCategories(
	shopId: number,
	categoryOrders: { id: number; sortOrder: number }[],
) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/shops/${shopId}/categories/reorder`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			method: "PATCH",
			credentials: "include",
			body: JSON.stringify(categoryOrders),
		},
	);

	if (!response.ok) throw new Error("Failed to reorder categories");

	return response.json();
}

export async function reorderProducts(
	shopId: number,
	productOrders: { id: number; sortOrder: number }[],
) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/shops/${shopId}/products/reorder`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			method: "PATCH",
			credentials: "include",
			body: JSON.stringify(productOrders),
		},
	);

	if (!response.ok) throw new Error("Failed to reorder products");

	return response.json();
}
