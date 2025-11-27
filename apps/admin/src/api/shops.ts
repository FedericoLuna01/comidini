import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type Shop = {
	id: number;
	name: string;
	description: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	logo: string | null;
	acceptsDelivery: boolean | null;
	acceptsPickup: boolean | null;
	createdAt: string;
	userId: string;
	userName: string | null;
	userEmail: string | null;
};

const getAllShops = async (): Promise<Shop[]> => {
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
