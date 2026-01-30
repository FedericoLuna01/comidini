import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// ===== TYPES =====

export interface Order {
	id: number;
	shopId: number;
	customerId: string | null;
	orderNumber: string;
	status:
		| "pending"
		| "confirmed"
		| "preparing"
		| "ready"
		| "in_delivery"
		| "delivered"
		| "cancelled"
		| "refunded";
	type: "delivery" | "pickup" | "dine_in";
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
	paymentMethod: "cash" | "card" | "transfer";
	paymentStatus: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	confirmedAt: string | null;
	completedAt: string | null;
}

export interface OrderWithItems {
	order: Order;
	items: Array<{
		orderItem: {
			id: number;
			orderId: number;
			productId: number;
			variantId: number | null;
			productName: string;
			productSku: string | null;
			quantity: number;
			unitPrice: string;
			totalPrice: string;
			notes: string | null;
		};
		product: {
			id: number;
			name: string;
			images: string[] | null;
		} | null;
		addons: Array<{
			id: number;
			orderItemId: number;
			addonId: number;
			addonName: string;
			quantity: number;
			unitPrice: string;
			totalPrice: string;
		}>;
	}>;
	statusHistory: Array<{
		id: number;
		orderId: number;
		status: string;
		notes: string | null;
		createdBy: string | null;
		createdAt: string;
	}>;
}

// ===== QUERY FUNCTIONS =====

/**
 * Obtiene todas las órdenes de una tienda
 */
async function getOrdersByShopId(shopId: number): Promise<Order[]> {
	const response = await fetch(`${API_URL}/orders/shop/${shopId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error al obtener las órdenes");
	}

	return response.json();
}

export const ordersByShopIdQueryOptions = (shopId: number | undefined) =>
	queryOptions<Order[]>({
		queryKey: ["get-orders", shopId],
		queryFn: () => getOrdersByShopId(shopId!),
		enabled: !!shopId,
	});

/**
 * Obtiene una orden por ID con sus items
 */
async function getOrderById(orderId: number): Promise<OrderWithItems> {
	const response = await fetch(`${API_URL}/orders/${orderId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Error al obtener la orden");
	}

	return response.json();
}

export const orderByIdQueryOptions = (orderId: number) =>
	queryOptions<OrderWithItems>({
		queryKey: ["get-order", orderId],
		queryFn: () => getOrderById(orderId),
		enabled: !!orderId,
	});

// ===== MUTATION FUNCTIONS =====

interface UpdateOrderStatusData {
	status: Order["status"];
	notes?: string;
}

/**
 * Actualiza el estado de una orden
 */
async function updateOrderStatus(
	orderId: number,
	data: UpdateOrderStatusData,
): Promise<{ success: boolean; order: Order; message: string }> {
	const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al actualizar el estado");
	}

	return response.json();
}

export const updateOrderStatusMutationOptions = (
	orderId: number,
): UseMutationOptions<
	{ success: boolean; order: Order; message: string },
	Error,
	UpdateOrderStatusData
> => ({
	mutationKey: ["update-order-status", orderId],
	mutationFn: (data) => updateOrderStatus(orderId, data),
});
