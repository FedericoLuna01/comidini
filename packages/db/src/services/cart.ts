import { and, eq } from "drizzle-orm";
import { db } from "../config";
import {
	cart,
	cartItem,
	cartItemAddon,
	product,
	productAddon,
	productVariant,
} from "../schema";
import type {
	AddToCartSchema,
	InsertCart,
	InsertCartItem,
	InsertCartItemAddon,
	UpdateCartItemSchema,
} from "../types/cart";

/**
 * Obtiene o crea un carrito para un usuario o sesión guest
 */
export const getOrCreateCart = async (params: {
	userId?: string;
	sessionId?: string;
	shopId: number;
}) => {
	const { userId, sessionId, shopId } = params;

	// Buscar carrito existente
	const where = userId
		? and(eq(cart.userId, userId), eq(cart.shopId, shopId))
		: and(eq(cart.sessionId, sessionId!), eq(cart.shopId, shopId));

	const [existingCart] = await db.select().from(cart).where(where).limit(1);

	if (existingCart) {
		return existingCart;
	}

	// Crear nuevo carrito
	const newCartData: InsertCart = {
		userId,
		sessionId,
		shopId,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
	};

	const [createdCart] = await db.insert(cart).values(newCartData).returning();

	return createdCart;
};

/**
 * Obtiene el carrito activo del usuario con todos sus items
 */
export const getCartWithItems = async (params: {
	userId?: string;
	sessionId?: string;
}) => {
	const { userId, sessionId } = params;

	const where = userId
		? eq(cart.userId, userId)
		: eq(cart.sessionId, sessionId!);

	const [userCart] = await db.select().from(cart).where(where).limit(1);

	if (!userCart) {
		return null;
	}

	// Obtener items del carrito con productos y variantes
	const items = await db
		.select({
			cartItem,
			product,
			variant: productVariant,
		})
		.from(cartItem)
		.leftJoin(product, eq(cartItem.productId, product.id))
		.leftJoin(productVariant, eq(cartItem.variantId, productVariant.id))
		.where(eq(cartItem.cartId, userCart.id));

	// Obtener add-ons de cada item
	const itemsWithAddons = await Promise.all(
		items.map(async (item) => {
			const addons = await db
				.select({
					cartItemAddon,
					addon: productAddon,
				})
				.from(cartItemAddon)
				.leftJoin(productAddon, eq(cartItemAddon.addonId, productAddon.id))
				.where(eq(cartItemAddon.cartItemId, item.cartItem.id));

			return {
				...item,
				addons,
			};
		}),
	);

	return {
		cart: userCart,
		items: itemsWithAddons,
	};
};

/**
 * Obtiene todos los carritos del usuario/sesión agrupados por tienda
 */
export const getAllCartsWithItems = async (params: {
	userId?: string;
	sessionId?: string;
}) => {
	const { userId, sessionId } = params;

	const where = userId
		? eq(cart.userId, userId)
		: eq(cart.sessionId, sessionId!);

	// Obtener todos los carritos del usuario
	const userCarts = await db.select().from(cart).where(where);

	if (userCarts.length === 0) {
		return [];
	}

	// Para cada carrito, obtener sus items
	const cartsWithItems = await Promise.all(
		userCarts.map(async (userCart) => {
			const items = await db
				.select({
					cartItem,
					product,
					variant: productVariant,
				})
				.from(cartItem)
				.leftJoin(product, eq(cartItem.productId, product.id))
				.leftJoin(productVariant, eq(cartItem.variantId, productVariant.id))
				.where(eq(cartItem.cartId, userCart.id));

			// Obtener add-ons de cada item
			const itemsWithAddons = await Promise.all(
				items.map(async (item) => {
					const addons = await db
						.select({
							cartItemAddon,
							addon: productAddon,
						})
						.from(cartItemAddon)
						.leftJoin(productAddon, eq(cartItemAddon.addonId, productAddon.id))
						.where(eq(cartItemAddon.cartItemId, item.cartItem.id));

					return {
						...item,
						addons,
					};
				}),
			);

			return {
				cart: userCart,
				items: itemsWithAddons,
			};
		}),
	);

	// Filtrar carritos vacíos
	return cartsWithItems.filter((c) => c.items.length > 0);
};

/**
 * Limpia el carrito (elimina todos los items)
 */
export const clearCart = async (cartId: number) => {
	await db.delete(cartItem).where(eq(cartItem.cartId, cartId));
};

/**
 * Limpia todos los carritos del usuario/sesión
 */
export const clearAllCarts = async (params: {
	userId?: string;
	sessionId?: string;
}) => {
	const { userId, sessionId } = params;

	const where = userId
		? eq(cart.userId, userId)
		: eq(cart.sessionId, sessionId!);

	// Obtener todos los carritos del usuario
	const userCarts = await db.select().from(cart).where(where);

	// Limpiar cada carrito
	for (const userCart of userCarts) {
		await db.delete(cartItem).where(eq(cartItem.cartId, userCart.id));
	}

	return userCarts.length;
};

/**
 * Elimina un carrito completamente
 */
export const deleteCart = async (cartId: number) => {
	await db.delete(cart).where(eq(cart.id, cartId));
};

// ===== CART ITEM OPERATIONS =====

/**
 * Agrega un item al carrito con sus add-ons
 */
export const addItemToCart = async (
	cartId: number,
	itemData: AddToCartSchema,
) => {
	const { productId, variantId, quantity, notes, addons } = itemData;

	// Validar que el producto existe y está activo
	const [productExists] = await db
		.select()
		.from(product)
		.where(and(eq(product.id, productId), eq(product.isActive, true)))
		.limit(1);

	if (!productExists) {
		throw new Error("Producto no encontrado o no disponible");
	}

	// Validar stock
	if (productExists.quantity !== null && productExists.quantity < quantity) {
		throw new Error("Stock insuficiente");
	}

	// Validar variante si se especificó
	if (variantId) {
		const [variantExists] = await db
			.select()
			.from(productVariant)
			.where(
				and(
					eq(productVariant.id, variantId),
					eq(productVariant.productId, productId),
					eq(productVariant.isActive, true),
				),
			)
			.limit(1);

		if (!variantExists) {
			throw new Error("Variante no encontrada o no disponible");
		}

		// Validar stock de la variante
		if (variantExists.quantity !== null && variantExists.quantity < quantity) {
			throw new Error("Stock insuficiente para la variante seleccionada");
		}
	}

	// Buscar si ya existe el mismo item en el carrito
	const whereClause = variantId
		? and(
				eq(cartItem.cartId, cartId),
				eq(cartItem.productId, productId),
				eq(cartItem.variantId, variantId),
			)
		: and(
				eq(cartItem.cartId, cartId),
				eq(cartItem.productId, productId),
				eq(cartItem.variantId, 0),
			);

	const [existingItem] = await db
		.select()
		.from(cartItem)
		.where(whereClause)
		.limit(1);

	let itemId: number;

	if (existingItem) {
		// Actualizar cantidad del item existente
		const [updated] = await db
			.update(cartItem)
			.set({
				quantity: existingItem.quantity + quantity,
				notes: notes || existingItem.notes,
				updatedAt: new Date(),
			})
			.where(eq(cartItem.id, existingItem.id))
			.returning();

		if (!updated) {
			throw new Error("Error al actualizar el item del carrito");
		}

		itemId = updated.id;
	} else {
		// Crear nuevo item
		const newItem: InsertCartItem = {
			cartId,
			productId,
			variantId: variantId || undefined,
			quantity,
			notes: notes || undefined,
		};

		const [created] = await db.insert(cartItem).values(newItem).returning();

		if (!created) {
			throw new Error("Error al agregar el item al carrito");
		}

		itemId = created.id;
	}

	// Agregar add-ons si existen
	if (addons && addons.length > 0) {
		// Si el item ya existía, eliminar add-ons anteriores
		if (existingItem) {
			await db
				.delete(cartItemAddon)
				.where(eq(cartItemAddon.cartItemId, itemId));
		}

		// Validar que los add-ons existen y son del producto correcto
		for (const addon of addons) {
			const [addonExists] = await db
				.select()
				.from(productAddon)
				.where(
					and(
						eq(productAddon.id, addon.addonId),
						eq(productAddon.productId, productId),
						eq(productAddon.isActive, true),
					),
				)
				.limit(1);

			if (!addonExists) {
				throw new Error(`Complemento ${addon.addonId} no encontrado`);
			}
		}

		// Insertar add-ons
		const addonValues: InsertCartItemAddon[] = addons.map((addon) => ({
			cartItemId: itemId,
			addonId: addon.addonId,
			quantity: addon.quantity,
		}));

		await db.insert(cartItemAddon).values(addonValues);
	}

	// Actualizar timestamp del carrito
	await db
		.update(cart)
		.set({ updatedAt: new Date() })
		.where(eq(cart.id, cartId));

	return itemId;
};

/**
 * Actualiza la cantidad o notas de un item del carrito
 */
export const updateCartItem = async (
	itemId: number,
	updates: UpdateCartItemSchema,
) => {
	const [updated] = await db
		.update(cartItem)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(cartItem.id, itemId))
		.returning();

	return updated;
};

/**
 * Elimina un item del carrito
 */
export const removeCartItem = async (itemId: number) => {
	await db.delete(cartItem).where(eq(cartItem.id, itemId));
};

/**
 * Fusiona un carrito de guest con el carrito del usuario autenticado
 */
export const mergeGuestCart = async (sessionId: string, userId: string) => {
	// Obtener carrito guest
	const [guestCart] = await db
		.select()
		.from(cart)
		.where(eq(cart.sessionId, sessionId))
		.limit(1);

	if (!guestCart) {
		return null;
	}

	// Obtener o crear carrito del usuario
	const userCart = await getOrCreateCart({
		userId,
		shopId: guestCart.shopId,
	});

	// Obtener items del carrito guest
	const guestItems = await db
		.select()
		.from(cartItem)
		.where(eq(cartItem.cartId, guestCart.id));

	// Transferir items al carrito del usuario
	for (const item of guestItems) {
		// Obtener add-ons del item
		const itemAddons = await db
			.select()
			.from(cartItemAddon)
			.where(eq(cartItemAddon.cartItemId, item.id));

		// Agregar al carrito del usuario

		if (!userCart) {
			throw new Error("El carrito del usuario no es válido");
		}

		await addItemToCart(userCart.id, {
			productId: item.productId,
			variantId: item.variantId || undefined,
			quantity: item.quantity,
			notes: item.notes || undefined,
			addons: itemAddons.map((addon) => ({
				addonId: addon.addonId,
				quantity: addon.quantity,
			})),
		});
	}

	// Eliminar carrito guest
	await deleteCart(guestCart.id);

	return userCart;
};
