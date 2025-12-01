import type { SelectProductWithCategory } from "@repo/db/src/types/product";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

const getAllProductByShopId = async (
	shopId: number,
): Promise<SelectProductWithCategory[]> => {
	const response = await fetch(`${API_URL}/products/shop/${shopId}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("Error al obtener los productos de la tienda");
	}
	return response.json();
};

export const allProductsByShopIdQueryOptions = (shopId: number) =>
	queryOptions({
		queryKey: ["get-all-products-by-shop-id", shopId],
		queryFn: () => getAllProductByShopId(shopId),
	});
