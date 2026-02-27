import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "../config";
import {
	cart,
	cartItem,
	cartItemAddon,
	cartItemModifier,
	modifierGroup,
	modifierOption,
	product,
	productAddon,
	productVariant,
} from "../schema";
import type {
	AddToCartSchema,
	AddToCartWithModifiersSchema,
	InsertCart,
	InsertCartItem,
	InsertCartItemAddon,
	InsertCartItemModifier,
	UpdateCartItemSchema,
} from "../types/cart";

/**
 * Construye la condición WHERE para buscar carritos por userId y/o sessionId.
 * Busca por ambos con OR cuando están disponibles para encontrar carritos
 * creados como guest (sessionId) o como usuario autenticado (userId).
 */
const buildCartWhere = (userId?: string, sessionId?: string) => {
	const conditions = [];
	if (userId) conditions.push(eq(cart.userId, userId));
	if (sessionId) conditions.push(eq(cart.sessionId, sessionId));
	if (conditions.length === 0) return undefined;
	return conditions.length > 1 ? or(...conditions) : conditions[0];
};

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
	const ownerWhere = buildCartWhere(userId, sessionId);
	if (!ownerWhere) throw new Error("userId or sessionId required");
	const where = and(ownerWhere, eq(cart.shopId, shopId));

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

	const where = buildCartWhere(userId, sessionId);
	if (!where) return null;

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

	const where = buildCartWhere(userId, sessionId);
	if (!where) return [];

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

			// Obtener add-ons y modifiers de cada item
			const itemsWithExtras = await Promise.all(
				items.map(async (item) => {
					const addons = await db
						.select({
							cartItemAddon,
							addon: productAddon,
						})
						.from(cartItemAddon)
						.leftJoin(productAddon, eq(cartItemAddon.addonId, productAddon.id))
						.where(eq(cartItemAddon.cartItemId, item.cartItem.id));

					// Get modifiers
					const modifiers = await db
						.select({
							cartItemModifier,
							option: modifierOption,
							group: modifierGroup,
						})
						.from(cartItemModifier)
						.leftJoin(
							modifierOption,
							eq(cartItemModifier.modifierOptionId, modifierOption.id),
						)
						.leftJoin(
							modifierGroup,
							eq(modifierOption.groupId, modifierGroup.id),
						)
						.where(eq(cartItemModifier.cartItemId, item.cartItem.id));

					return {
						...item,
						addons,
						modifiers,
					};
				}),
			);

			return {
				cart: userCart,
				items: itemsWithExtras,
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

	const where = buildCartWhere(userId, sessionId);
	if (!where) return 0;

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
				isNull(cartItem.variantId),
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

// ============================================================
// NEW: Cart operations with modifier groups
// ============================================================

/**
 * Agrega un item al carrito con modificadores (nuevo sistema)
 */
export const addItemToCartWithModifiers = async (
	cartId: number,
	itemData: AddToCartWithModifiersSchema,
) => {
	const { productId, quantity, notes, modifiers, addons, variantId } = itemData;

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

	// Validar variante si se especificó (legacy support)
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
	}

	// Validar modificadores si existen
	if (modifiers && modifiers.length > 0) {
		for (const mod of modifiers) {
			const [optionExists] = await db
				.select({
					option: modifierOption,
					group: modifierGroup,
				})
				.from(modifierOption)
				.leftJoin(modifierGroup, eq(modifierOption.groupId, modifierGroup.id))
				.where(
					and(
						eq(modifierOption.id, mod.modifierOptionId),
						eq(modifierOption.isActive, true),
					),
				)
				.limit(1);

			if (!optionExists?.option) {
				throw new Error(
					`Opción de modificador ${mod.modifierOptionId} no encontrada`,
				);
			}

			// Verify the modifier group belongs to this product
			if (optionExists.group?.productId !== productId) {
				throw new Error(`Opción de modificador no corresponde a este producto`);
			}
		}
	}

	// Sort modifier option IDs to create a consistent "signature" for comparison
	const modifierSignature = modifiers
		? [...modifiers]
				.sort((a, b) => a.modifierOptionId - b.modifierOptionId)
				.map((m) => `${m.modifierOptionId}:${m.quantity}`)
				.join(",")
		: "";

	// Find existing cart items for this product
	const existingItems = await db
		.select()
		.from(cartItem)
		.where(
			and(
				eq(cartItem.cartId, cartId),
				eq(cartItem.productId, productId),
				variantId
					? eq(cartItem.variantId, variantId)
					: isNull(cartItem.variantId),
			),
		);

	// Check if any existing item has the same modifier signature
	let matchingItemId: number | null = null;

	for (const item of existingItems) {
		const itemModifiers = await db
			.select()
			.from(cartItemModifier)
			.where(eq(cartItemModifier.cartItemId, item.id));

		const existingSignature = [...itemModifiers]
			.sort((a, b) => a.modifierOptionId - b.modifierOptionId)
			.map((m) => `${m.modifierOptionId}:${m.quantity}`)
			.join(",");

		if (existingSignature === modifierSignature) {
			matchingItemId = item.id;
			break;
		}
	}

	let itemId: number;

	if (matchingItemId) {
		// Update quantity of existing item with same modifiers
		const existingItem = existingItems.find((i) => i.id === matchingItemId);
		if (!existingItem) {
			throw new Error("Error al encontrar el item existente");
		}

		const [updated] = await db
			.update(cartItem)
			.set({
				quantity: existingItem.quantity + quantity,
				notes: notes || existingItem.notes,
				updatedAt: new Date(),
			})
			.where(eq(cartItem.id, matchingItemId))
			.returning();

		if (!updated) {
			throw new Error("Error al actualizar el item del carrito");
		}

		itemId = updated.id;
	} else {
		// Create new item with different modifiers
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

		// Add modifiers only for new items
		if (modifiers && modifiers.length > 0) {
			const modifierValues: InsertCartItemModifier[] = modifiers.map((mod) => ({
				cartItemId: itemId,
				modifierOptionId: mod.modifierOptionId,
				quantity: mod.quantity,
				priceAdjustment: mod.priceAdjustment,
			}));

			await db.insert(cartItemModifier).values(modifierValues);
		}
	}

	// Agregar add-ons legacy si existen
	if (addons && addons.length > 0) {
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
 * Obtiene el carrito con items incluyendo modificadores
 */
export const getCartWithItemsAndModifiers = async (params: {
	userId?: string;
	sessionId?: string;
}) => {
	const { userId, sessionId } = params;

	const where = buildCartWhere(userId, sessionId);
	if (!where) return null;

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

	// Obtener add-ons y modifiers de cada item
	const itemsWithExtras = await Promise.all(
		items.map(async (item) => {
			// Legacy addons
			const addons = await db
				.select({
					cartItemAddon,
					addon: productAddon,
				})
				.from(cartItemAddon)
				.leftJoin(productAddon, eq(cartItemAddon.addonId, productAddon.id))
				.where(eq(cartItemAddon.cartItemId, item.cartItem.id));

			// New modifiers
			const modifiers = await db
				.select({
					cartItemModifier,
					option: modifierOption,
					group: modifierGroup,
				})
				.from(cartItemModifier)
				.leftJoin(
					modifierOption,
					eq(cartItemModifier.modifierOptionId, modifierOption.id),
				)
				.leftJoin(modifierGroup, eq(modifierOption.groupId, modifierGroup.id))
				.where(eq(cartItemModifier.cartItemId, item.cartItem.id));

			return {
				...item,
				addons,
				modifiers,
			};
		}),
	);

	return {
		cart: userCart,
		items: itemsWithExtras,
	};
};
