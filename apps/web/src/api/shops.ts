import type { SelectShop } from "@repo/db/src/types/shop";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

const getAllShops = async (): Promise<SelectShop[]> => {
	const response = await fetch(`${API_URL}/shops`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener las tiendas");
	}

	return response.json();
};

export const allShopsQueryOptions = queryOptions({
	queryKey: ["get-all-shops"],
	queryFn: getAllShops,
});

const getShopById = async (shopId: number): Promise<SelectShop> => {
	const response = await fetch(`${API_URL}/shops/${shopId}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener la tienda");
	}

	return response.json();
};

export const shopByIdQueryOptions = (shopId: number) =>
	queryOptions({
		queryKey: ["get-shop-by-id", shopId],
		queryFn: () => getShopById(shopId),
	});
