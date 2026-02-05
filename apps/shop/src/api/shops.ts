import type {
	CreateShop,
	CreateShopHours,
	UpdateShop,
} from "@repo/db/src/types/shop";

const API_URL = import.meta.env.VITE_API_URL;

export async function createShop(data: CreateShop) {
	const response = await fetch(`${API_URL}/shops`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	const result = await response.json();

	if (!response.ok) {
		console.error("Error creating shop:", result);
		throw new Error(result.error || "Error al crear la tienda");
	}

	return result;
}

export async function updateShop(data: UpdateShop, shopId: number) {
	const response = await fetch(`${API_URL}/shops/${shopId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Failed to update shop");
	}

	return response.json();
}

export async function getShopHours() {
	const response = await fetch(`${API_URL}/shops/hours`, {
		method: "GET",
		credentials: "include",
	});

	return response.json();
}

export async function updateShopHours(hoursData: CreateShopHours[]) {
	const response = await fetch(`${API_URL}/shops/hours`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(hoursData),
	});

	if (!response.ok) {
		throw new Error("Failed to update shop hours");
	}

	return response.json();
}

export interface ShopStatus {
	shop: {
		id: number;
		name: string;
		// ... otros campos
	} | null;
	hasShop: boolean;
}

export async function getShopStatus(): Promise<ShopStatus> {
	const response = await fetch(`${API_URL}/shops/status`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch shop status");
	}

	return response.json();
}
