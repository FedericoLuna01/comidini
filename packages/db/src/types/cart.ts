import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cart, cartItem, cartItemAddon } from "../schema";

// ===== CART SCHEMAS =====

export const insertCartSchema = createInsertSchema(cart, {
	userId: z.string().optional(),
	shopId: z.number().min(1, { message: "La tienda es requerida" }),
	sessionId: z.string().optional(),
	expiresAt: z.date().optional(),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const selectCartSchema = createSelectSchema(cart);

export type InsertCart = z.infer<typeof insertCartSchema>;
export type SelectCart = z.infer<typeof selectCartSchema>;

// ===== CART ITEM SCHEMAS =====

export const insertCartItemSchema = createInsertSchema(cartItem, {
	cartId: z.number().min(1, { message: "El carrito es requerido" }),
	productId: z.number().min(1, { message: "El producto es requerido" }),
	variantId: z.number().optional(),
	quantity: z
		.number()
		.min(1, { message: "La cantidad debe ser al menos 1" })
		.max(99, { message: "La cantidad no puede exceder 99 unidades" }),
	notes: z
		.string()
		.max(500, { message: "Las notas no pueden exceder 500 caracteres" })
		.optional(),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const addCartItemSchema = insertCartItemSchema.omit({
	cartId: true,
});

export const updateCartItemSchema = z.object({
	quantity: z
		.number()
		.min(1, { message: "La cantidad debe ser al menos 1" })
		.max(99, { message: "La cantidad no puede exceder 99 unidades" })
		.optional(),
	notes: z
		.string()
		.max(500, { message: "Las notas no pueden exceder 500 caracteres" })
		.optional(),
	variantId: z.number().optional(),
});

export const selectCartItemSchema = createSelectSchema(cartItem);

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type AddCartItemSchema = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemSchema = z.infer<typeof updateCartItemSchema>;
export type SelectCartItem = z.infer<typeof selectCartItemSchema>;

// ===== CART ITEM ADDON SCHEMAS =====

export const insertCartItemAddonSchema = createInsertSchema(cartItemAddon, {
	cartItemId: z
		.number()
		.min(1, { message: "El item del carrito es requerido" }),
	addonId: z.number().min(1, { message: "El complemento es requerido" }),
	quantity: z
		.number()
		.min(1, { message: "La cantidad debe ser al menos 1" })
		.max(99, { message: "La cantidad no puede exceder 99 unidades" }),
}).omit({
	id: true,
	createdAt: true,
});

export const selectCartItemAddonSchema = createSelectSchema(cartItemAddon);

export type InsertCartItemAddon = z.infer<typeof insertCartItemAddonSchema>;
export type SelectCartItemAddon = z.infer<typeof selectCartItemAddonSchema>;

// ===== COMBINED SCHEMAS FOR API =====

// Schema para agregar items al carrito con sus add-ons
export const addToCartSchema = z.object({
	productId: z.number().min(1, { message: "El producto es requerido" }),
	variantId: z.number().optional(),
	quantity: z
		.number()
		.min(1, { message: "La cantidad debe ser al menos 1" })
		.max(99, { message: "La cantidad no puede exceder 99 unidades" })
		.default(1),
	notes: z
		.string()
		.max(500, { message: "Las notas no pueden exceder 500 caracteres" })
		.optional(),
	addons: z
		.array(
			z.object({
				addonId: z.number().min(1, { message: "El complemento es requerido" }),
				quantity: z
					.number()
					.min(1, { message: "La cantidad debe ser al menos 1" })
					.default(1),
			}),
		)
		.optional()
		.default([]),
});

export type AddToCartSchema = z.infer<typeof addToCartSchema>;
