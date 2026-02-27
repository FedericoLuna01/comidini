import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { getOrCreateSessionId } from "./cart";

const API_URL = import.meta.env.VITE_API_URL;

// ===== TYPES =====

export interface CreateOrderData {
	shopId: number;
	customerName: string;
	customerEmail?: string;
	customerPhone: string;
	type: "delivery" | "pickup" | "dine_in";
	paymentMethod: "cash" | "card" | "transfer" | "mercadopago";
	deliveryAddress?: string;
	deliveryInstructions?: string;
	notes?: string;
}

export interface Order {
	id: number;
	shopId: number;
	customerId: string | null;
	orderNumber: string;
	status: string;
	type: string;
	customerName: string;
	customerEmail: string | null;
	customerPhone: string;
	deliveryAddress: string | null;
	deliveryInstructions: string | null;
	subtotal: string;
	taxAmount: string;
	deliveryFee: string;
	discountAmount: string;
	total: string;
	paymentMethod: string;
	paymentStatus: string;
	notes: string | null;
	shopName: string | null;
	createdAt: string;
	updatedAt: string;
}

// ===== QUERY FUNCTIONS =====

/**
 * Obtiene las órdenes del cliente actual
 */
const getMyOrders = async (): Promise<Order[]> => {
	const response = await fetch(`${API_URL}/orders/my-orders`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener las órdenes");
	}

	return response.json();
};

export const myOrdersQueryOptions = queryOptions({
	queryKey: ["my-orders"],
	queryFn: getMyOrders,
	staleTime: 1000 * 60,
});

// ===== MUTATION FUNCTIONS =====

/**
 * Crea una nueva orden a partir del carrito
 */
const createOrder = async (
	data: CreateOrderData,
): Promise<{ success: boolean; order: Order; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/orders`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al crear la orden");
	}

	return response.json();
};

export const createOrderMutationOptions = (): UseMutationOptions<
	{ success: boolean; order: Order; message: string },
	Error,
	CreateOrderData
> => ({
	mutationKey: ["create-order"],
	mutationFn: createOrder,
});

// ===== MERCADOPAGO PREFERENCE =====

export interface MpPreferenceResponse {
	preferenceId: string;
	initPoint: string;
	sandboxInitPoint: string;
}

/**
 * Crea una preferencia de Mercado Pago para una orden existente
 */
const createMpPreference = async (
	orderId: number,
): Promise<MpPreferenceResponse> => {
	const response = await fetch(`${API_URL}/mercadopago/preference`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ orderId }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.error || "Error al crear la preferencia de Mercado Pago",
		);
	}

	return response.json();
};

export const createMpPreferenceMutationOptions = (): UseMutationOptions<
	MpPreferenceResponse,
	Error,
	number
> => ({
	mutationKey: ["create-mp-preference"],
	mutationFn: createMpPreference,
});

// ===== ORDER BY ID =====

/**
 * Obtiene una orden por ID con sus items
 */
const getOrderById = async (orderId: number) => {
	const response = await fetch(`${API_URL}/orders/${orderId}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener la orden");
	}

	return response.json();
};

export const orderByIdQueryOptions = (orderId: number) =>
	queryOptions({
		queryKey: ["order-by-id", orderId],
		queryFn: () => getOrderById(orderId),
		staleTime: 1000 * 30,
	});
