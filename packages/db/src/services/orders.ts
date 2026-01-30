import { desc, eq } from "drizzle-orm";
import { db } from "../config";
import { cartItem, cartItemAddon } from "../schema/cart-schema";
import {
	product,
	productAddon,
	productVariant,
} from "../schema/product-schema";
import {
	order,
	orderItem,
	orderItemAddon,
	orderStatusHistory,
} from "../schema/shop-schema";
import type { Order } from "../types/shop";

// ===== ORDER OPERATIONS =====

/**
 * Genera un número de orden único
 */
const generateOrderNumber = (): string => {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `ORD-${timestamp}-${random}`;
};

/**
 * Crea una orden a partir del carrito actual
 */
export const createOrderFromCart = async (params: {
	cartId: number;
	shopId: number;
	customerId?: string;
	customerName: string;
	customerEmail?: string;
	customerPhone: string;
	type: "delivery" | "pickup" | "dine_in";
	paymentMethod: "cash" | "card" | "transfer";
	deliveryAddress?: string;
	deliveryInstructions?: string;
	notes?: string;
}) => {
	const {
		cartId,
		shopId,
		customerId,
		customerName,
		customerEmail,
		customerPhone,
		type,
		paymentMethod,
		deliveryAddress,
		deliveryInstructions,
		notes,
	} = params;

	// Obtener items del carrito
	const cartItems = await db
		.select({
			cartItem,
			product,
			variant: productVariant,
		})
		.from(cartItem)
		.leftJoin(product, eq(cartItem.productId, product.id))
		.leftJoin(productVariant, eq(cartItem.variantId, productVariant.id))
		.where(eq(cartItem.cartId, cartId));

	if (cartItems.length === 0) {
		throw new Error("El carrito está vacío");
	}

	// Calcular totales
	let subtotal = 0;
	const itemsData: Array<{
		productId: number;
		variantId: number | null;
		productName: string;
		productSku: string | null;
		quantity: number;
		unitPrice: number;
		totalPrice: number;
		notes: string | null;
		addons: Array<{
			addonId: number;
			addonName: string;
			quantity: number;
			unitPrice: number;
			totalPrice: number;
		}>;
	}> = [];

	for (const item of cartItems) {
		if (!item.product) continue;

		const basePrice = Number.parseFloat(item.product.price);
		const variantPrice = item.variant?.extraPrice
			? Number.parseFloat(item.variant.extraPrice)
			: 0;

		// Obtener add-ons del item
		const addons = await db
			.select({
				cartItemAddon,
				addon: productAddon,
			})
			.from(cartItemAddon)
			.leftJoin(productAddon, eq(cartItemAddon.addonId, productAddon.id))
			.where(eq(cartItemAddon.cartItemId, item.cartItem.id));

		let addonsPrice = 0;
		const addonsData: Array<{
			addonId: number;
			addonName: string;
			quantity: number;
			unitPrice: number;
			totalPrice: number;
		}> = [];

		for (const addonItem of addons) {
			if (!addonItem.addon) continue;
			const addonUnitPrice = Number.parseFloat(addonItem.addon.price);
			const addonTotalPrice = addonUnitPrice * addonItem.cartItemAddon.quantity;
			addonsPrice += addonTotalPrice;

			addonsData.push({
				addonId: addonItem.addon.id,
				addonName: addonItem.addon.name,
				quantity: addonItem.cartItemAddon.quantity,
				unitPrice: addonUnitPrice,
				totalPrice: addonTotalPrice,
			});
		}

		const unitPrice = basePrice + variantPrice;
		const itemTotalPrice =
			(unitPrice + addonsPrice / item.cartItem.quantity) *
			item.cartItem.quantity;
		subtotal += itemTotalPrice;

		itemsData.push({
			productId: item.product.id,
			variantId: item.variant?.id || null,
			productName: item.variant
				? `${item.product.name} - ${item.variant.name}`
				: item.product.name,
			productSku: item.product.sku,
			quantity: item.cartItem.quantity,
			unitPrice,
			totalPrice: itemTotalPrice,
			notes: item.cartItem.notes,
			addons: addonsData,
		});
	}

	const total = subtotal; // Aquí se pueden agregar impuestos, delivery fee, etc.

	// Crear la orden
	const [createdOrder] = await db
		.insert(order)
		.values({
			shopId,
			customerId,
			orderNumber: generateOrderNumber(),
			status: "pending",
			type,
			customerName,
			customerEmail,
			customerPhone,
			deliveryAddress,
			deliveryInstructions,
			subtotal: subtotal.toFixed(2),
			total: total.toFixed(2),
			paymentMethod,
			paymentStatus: "pending",
			notes,
		})
		.returning();

	if (!createdOrder) {
		throw new Error("Error al crear la orden");
	}

	// Crear items de la orden
	for (const itemData of itemsData) {
		const [createdItem] = await db
			.insert(orderItem)
			.values({
				orderId: createdOrder.id,
				productId: itemData.productId,
				variantId: itemData.variantId,
				productName: itemData.productName,
				productSku: itemData.productSku,
				quantity: itemData.quantity,
				unitPrice: itemData.unitPrice.toFixed(2),
				totalPrice: itemData.totalPrice.toFixed(2),
				notes: itemData.notes,
			})
			.returning();

		if (createdItem && itemData.addons.length > 0) {
			// Crear add-ons del item
			for (const addon of itemData.addons) {
				await db.insert(orderItemAddon).values({
					orderItemId: createdItem.id,
					addonId: addon.addonId,
					addonName: addon.addonName,
					quantity: addon.quantity,
					unitPrice: addon.unitPrice.toFixed(2),
					totalPrice: addon.totalPrice.toFixed(2),
				});
			}
		}
	}

	// Crear historial de estado inicial
	await db.insert(orderStatusHistory).values({
		orderId: createdOrder.id,
		status: "pending",
		notes: "Orden creada",
		createdBy: customerId,
	});

	// Limpiar el carrito
	await db.delete(cartItem).where(eq(cartItem.cartId, cartId));

	return createdOrder;
};

/**
 * Obtiene todas las órdenes de una tienda
 */
export const getOrdersByShopId = async (shopId: number) => {
	const orders = await db
		.select()
		.from(order)
		.where(eq(order.shopId, shopId))
		.orderBy(desc(order.createdAt));

	return orders;
};

/**
 * Obtiene una orden por ID con sus items
 */
export const getOrderById = async (orderId: number) => {
	const [orderData] = await db
		.select()
		.from(order)
		.where(eq(order.id, orderId))
		.limit(1);

	if (!orderData) {
		return null;
	}

	// Obtener items
	const items = await db
		.select({
			orderItem,
			product,
		})
		.from(orderItem)
		.leftJoin(product, eq(orderItem.productId, product.id))
		.where(eq(orderItem.orderId, orderId));

	// Obtener add-ons de cada item
	const itemsWithAddons = await Promise.all(
		items.map(async (item) => {
			const addons = await db
				.select()
				.from(orderItemAddon)
				.where(eq(orderItemAddon.orderItemId, item.orderItem.id));

			return {
				...item,
				addons,
			};
		}),
	);

	// Obtener historial de estados
	const statusHistory = await db
		.select()
		.from(orderStatusHistory)
		.where(eq(orderStatusHistory.orderId, orderId))
		.orderBy(desc(orderStatusHistory.createdAt));

	return {
		order: orderData,
		items: itemsWithAddons,
		statusHistory,
	};
};

/**
 * Actualiza el estado de una orden
 */
export const updateOrderStatus = async (params: {
	orderId: number;
	status: Order["status"];
	notes?: string;
	updatedBy?: string;
}) => {
	const { orderId, status, notes, updatedBy } = params;

	const [updatedOrder] = await db
		.update(order)
		.set({
			status,
			updatedAt: new Date(),
			...(status === "confirmed" && { confirmedAt: new Date() }),
			...(status === "delivered" && { completedAt: new Date() }),
		})
		.where(eq(order.id, orderId))
		.returning();

	// Agregar al historial
	await db.insert(orderStatusHistory).values({
		orderId,
		status,
		notes,
		createdBy: updatedBy,
	});

	return updatedOrder;
};

/**
 * Obtiene las órdenes de un cliente
 */
export const getOrdersByCustomerId = async (customerId: string) => {
	const orders = await db
		.select()
		.from(order)
		.where(eq(order.customerId, customerId))
		.orderBy(desc(order.createdAt));

	return orders;
};
