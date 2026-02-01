import {
	decimal,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
	modifierOption,
	product,
	productAddon,
	productVariant,
} from "./product-schema";
import { shop } from "./shop-schema";

// Carrito de compras
export const cart = pgTable("cart", {
	id: serial("id").primaryKey(),
	userId: text("user_id").references(() => user.id, { onDelete: "cascade" }), // null para usuarios invitados
	shopId: integer("shop_id")
		.notNull()
		.references(() => shop.id, { onDelete: "cascade" }), // Carrito de una sola tienda
	sessionId: text("session_id"), // Para carritos de usuarios invitados
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	expiresAt: timestamp("expires_at"), // Auto-cleanup de carritos viejos
});

// Items en el carrito
export const cartItem = pgTable("cart_item", {
	id: serial("id").primaryKey(),
	cartId: integer("cart_id")
		.notNull()
		.references(() => cart.id, { onDelete: "cascade" }),
	productId: integer("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "cascade" }),
	variantId: integer("variant_id").references(() => productVariant.id, {
		onDelete: "cascade",
	}), // null si no tiene variante (DEPRECATED)
	quantity: integer("quantity")
		.notNull()
		.$defaultFn(() => 1),
	notes: text("notes"), // Notas especiales: "Sin cebolla", "Bien cocido", etc.
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// Add-ons/extras del item del carrito (DEPRECATED - Use cartItemModifier)
export const cartItemAddon = pgTable("cart_item_addon", {
	id: serial("id").primaryKey(),
	cartItemId: integer("cart_item_id")
		.notNull()
		.references(() => cartItem.id, { onDelete: "cascade" }),
	addonId: integer("addon_id")
		.notNull()
		.references(() => productAddon.id, { onDelete: "cascade" }),
	quantity: integer("quantity")
		.notNull()
		.$defaultFn(() => 1),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// ============================================================
// NEW: Modifier selections for cart items
// ============================================================

/**
 * Selected modifiers for cart items
 * Stores the customer's choices from modifier groups
 */
export const cartItemModifier = pgTable("cart_item_modifier", {
	id: serial("id").primaryKey(),
	cartItemId: integer("cart_item_id")
		.notNull()
		.references(() => cartItem.id, { onDelete: "cascade" }),
	modifierOptionId: integer("modifier_option_id")
		.notNull()
		.references(() => modifierOption.id, { onDelete: "cascade" }),
	quantity: integer("quantity")
		.notNull()
		.$defaultFn(() => 1),

	// Snapshot of price at time of selection (for consistency)
	priceAdjustment: decimal("price_adjustment", {
		precision: 10,
		scale: 2,
	}).notNull(),

	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});
