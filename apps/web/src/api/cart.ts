import type {
	AddToCartSchema,
	AddToCartWithModifiersSchema,
	UpdateCartItemSchema,
} from "@repo/db/src/types/cart";
import type { UseMutationOptions } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Utilidad para obtener o generar sessionId para usuarios guest
export const getOrCreateSessionId = (): string => {
	const existingSessionId = localStorage.getItem("guestSessionId");
	if (existingSessionId) {
		return existingSessionId;
	}
	const newSessionId = crypto.randomUUID();
	localStorage.setItem("guestSessionId", newSessionId);
	return newSessionId;
};

// Utilidad para limpiar sessionId cuando el usuario se autentica
export const clearGuestSessionId = (): void => {
	localStorage.removeItem("guestSessionId");
};

export interface CartItemWithDetails {
	cartItem: {
		id: number;
		cartId: number;
		productId: number;
		variantId: number | null;
		quantity: number;
		notes: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
	product: {
		id: number;
		shopId: number;
		categoryId: number | null;
		name: string;
		description: string | null;
		price: string;
		sku: string | null;
		quantity: number;
		lowStockThreshold: number;
		images: string[] | null;
		isActive: boolean;
		isFeatured: boolean;
		tags: string[] | null;
		sortOrder: number;
		createdAt: Date;
		updatedAt: Date;
	} | null;
	variant: {
		id: number;
		productId: number;
		name: string;
		extraPrice: string | null;
		sku: string | null;
		quantity: number;
		isActive: boolean;
		sortOrder: number;
		createdAt: Date;
		updatedAt: Date;
	} | null;
	addons: Array<{
		cartItemAddon: {
			id: number;
			cartItemId: number;
			addonId: number;
			quantity: number;
			createdAt: Date;
		};
		addon: {
			id: number;
			productId: number;
			name: string;
			description: string | null;
			price: string;
			isRequired: boolean;
			maxQuantity: number;
			isActive: boolean;
			sortOrder: number;
			createdAt: Date;
			updatedAt: Date;
		} | null;
	}>;
	modifiers: Array<{
		cartItemModifier: {
			id: number;
			cartItemId: number;
			modifierOptionId: number;
			quantity: number;
			createdAt: Date;
		};
		option: {
			id: number;
			groupId: number;
			name: string;
			priceAdjustment: string;
			isDefault: boolean;
			isActive: boolean;
			sortOrder: number;
		} | null;
		group: {
			id: number;
			productId: number;
			name: string;
			description: string | null;
		} | null;
	}>;
}

export interface CartData {
	cart: {
		id: number;
		userId: string | null;
		shopId: number;
		sessionId: string | null;
		createdAt: Date;
		updatedAt: Date;
		expiresAt: Date | null;
	} | null;
	items: CartItemWithDetails[];
}

export interface CartWithShopInfo extends CartData {
	shop: {
		id: number;
		name: string;
		logo: string | null;
	} | null;
}

// ===== QUERY FUNCTIONS =====

/**
 * Obtiene el carrito actual del usuario o guest
 */
const getCart = async (): Promise<CartData> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener el carrito");
	}

	return response.json();
};

export const cartQueryOptions = queryOptions({
	queryKey: ["cart"],
	queryFn: getCart,
	staleTime: 1000 * 60, // 1 minuto
});

/**
 * Obtiene todos los carritos del usuario agrupados por tienda
 */
const getAllCarts = async (): Promise<CartWithShopInfo[]> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart/all`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener los carritos");
	}

	return response.json();
};

export const allCartsQueryOptions = queryOptions({
	queryKey: ["all-carts"],
	queryFn: getAllCarts,
	staleTime: 1000 * 60, // 1 minuto
});

/**
 * Obtiene el carrito del usuario para una tienda específica
 */
export const cartByShopQueryOptions = (shopId: number) =>
	queryOptions<CartWithShopInfo | null>({
		queryKey: ["cart-by-shop", shopId],
		queryFn: async () => {
			const carts = await getAllCarts();
			return carts.find((c) => c.cart?.shopId === shopId) || null;
		},
		enabled: !!shopId,
		staleTime: 1000 * 60,
	});

// ===== MUTATION FUNCTIONS =====

// Legacy interface for backward compatibility
interface AddToCartPayload extends AddToCartSchema {
	shopId: number;
}

// New interface that supports modifiers
interface AddToCartWithModifiersPayload extends AddToCartWithModifiersSchema {
	shopId: number;
}

/**
 * Agrega un item al carrito (supports both legacy addons and new modifiers)
 */
const addToCart = async (
	payload: AddToCartPayload | AddToCartWithModifiersPayload,
): Promise<{ success: boolean; itemId: number; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart/items`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al agregar al carrito");
	}

	return response.json();
};

/**
 * Agrega un item al carrito con modificadores (nuevo sistema)
 */
const addToCartWithModifiers = async (
	payload: AddToCartWithModifiersPayload,
): Promise<{ success: boolean; itemId: number; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart/items/with-modifiers`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al agregar al carrito");
	}

	return response.json();
};

export const addToCartMutationOptions = (): UseMutationOptions<
	{ success: boolean; itemId: number; message: string },
	Error,
	AddToCartPayload | AddToCartWithModifiersPayload
> => ({
	mutationKey: ["add-to-cart"],
	mutationFn: addToCart,
});

export const addToCartWithModifiersMutationOptions = (): UseMutationOptions<
	{ success: boolean; itemId: number; message: string },
	Error,
	AddToCartWithModifiersPayload
> => ({
	mutationKey: ["add-to-cart-with-modifiers"],
	mutationFn: addToCartWithModifiers,
});

/**
 * Actualiza un item del carrito
 */
const updateCartItem = async (params: {
	itemId: number;
	updates: UpdateCartItemSchema;
}): Promise<{ success: boolean; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart/items/${params.itemId}`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
		body: JSON.stringify(params.updates),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al actualizar el item");
	}

	return response.json();
};

export const updateCartItemMutationOptions = (): UseMutationOptions<
	{ success: boolean; message: string },
	Error,
	{ itemId: number; updates: UpdateCartItemSchema }
> => ({
	mutationKey: ["update-cart-item"],
	mutationFn: updateCartItem,
});

/**
 * Elimina un item del carrito
 */
const removeCartItem = async (
	itemId: number,
): Promise<{ success: boolean; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al eliminar el item");
	}

	return response.json();
};

export const removeCartItemMutationOptions = (): UseMutationOptions<
	{ success: boolean; message: string },
	Error,
	number
> => ({
	mutationKey: ["remove-cart-item"],
	mutationFn: removeCartItem,
});

/**
 * Limpia todos los items del carrito
 */
const clearCart = async (): Promise<{ success: boolean; message: string }> => {
	const sessionId = getOrCreateSessionId();

	const response = await fetch(`${API_URL}/cart`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-session-id": sessionId,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al limpiar el carrito");
	}

	return response.json();
};

export const clearCartMutationOptions = (): UseMutationOptions<
	{ success: boolean; message: string },
	Error,
	void
> => ({
	mutationKey: ["clear-cart"],
	mutationFn: clearCart,
});

/**
 * Fusiona el carrito guest con el carrito del usuario autenticado
 */
const mergeGuestCart = async (
	sessionId: string,
): Promise<{ success: boolean; message: string }> => {
	const response = await fetch(`${API_URL}/cart/merge`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ sessionId }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error al fusionar los carritos");
	}

	return response.json();
};

export const mergeGuestCartMutationOptions = (): UseMutationOptions<
	{ success: boolean; message: string },
	Error,
	string
> => ({
	mutationKey: ["merge-guest-cart"],
	mutationFn: mergeGuestCart,
});
