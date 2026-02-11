import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import {
	modifierGroup,
	modifierOption,
	product,
	productAddon,
	productCategory,
	productVariant,
} from "../schema";

export const insertProductSchema = createInsertSchema(product, {
	name: z
		.string()
		.min(1, { message: "El nombre del producto es requerido" })
		.max(100, {
			message: "El nombre del producto no puede exceder los 100 caracteres",
		}),
	description: z
		.string()
		.max(100, { message: "La descripción debe ser mas corta." })
		.optional(),
	price: z.string(),
	// price: z.string(),
	sku: z
		.string()
		.min(1, { message: "El SKU es requerido" })
		.max(50, { message: "El SKU no puede exceder los 50 caracteres" }),
	quantity: z
		.number()
		.min(0, { message: "La cantidad de productos no puede ser negativo" }),
	lowStockThreshold: z.number().min(0),
	images: z
		.array(z.string({ message: "La imagen debe ser una URL válida" }))
		.min(1, { message: "Se requiere al menos una imagen" }),
	categoryId: z
		.number({ message: "La categoría es requerida" })
		.min(0, { message: "La categoría es requerida" }),
	isFeatured: z.boolean(),
	isActive: z.boolean(),
	tags: z.array(z.string()).optional(),
	sortOrder: z.number().min(0),
	shopId: z.number(),
}).omit({
	updatedAt: true,
	createdAt: true,
	id: true,
});

export const createProductSchema = insertProductSchema.omit({
	shopId: true,
});

export const updateProductSchema = insertProductSchema.partial();

export type InsertProductSchema = z.infer<typeof insertProductSchema>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

const SelectProduct = createSelectSchema(product);

export type SelectProduct = z.infer<typeof SelectProduct>;

// export const insertProductVariantSchema = createInsertSchema(productVariant, {
//   name: z.string()
//     .min(1, { message: "El nombre de la variante es requerido" })
//     .max(50, { message: "El nombre de la variante no puede exceder los 50 caracteres" }),
//   extraPrice: z.number().min(0, { message: "El precio adicional no puede ser negativo" }).optional(),
//   sku: z.string().min(1, { message: "El SKU es requerido" }).max(50, { message: "El SKU no puede exceder los 50 caracteres" }),
//   quantity: z.number().min(0, { message: "La cantidad no puede ser negativa" }).default(0),
//   isActive: z.boolean().default(true),
//   sortOrder: z.number().min(0).default(0),
// }).omit({
//   updatedAt: true,
//   createdAt: true,
// })

// export const insertProductAddonSchema = createInsertSchema(productAddon, {
//   name: z.string()
//     .min(1, { message: "El nombre del complemento es requerido" })
//     .max(50, { message: "El nombre del complemento no puede exceder los 50 caracteres" }),
//   description: z.string().max(200, { message: "La descripción debe ser más corta." }).optional(),
//   price: z.number().min(0, { message: "El precio no puede ser negativo" }),
//   isRequired: z.boolean().default(false),
//   maxQuantity: z.number().min(1, { message: "La cantidad máxima debe ser mayor a 0" }).default(1),
//   isActive: z.boolean().default(true),
//   sortOrder: z.number().min(0).default(0),
// }).omit({
//   updatedAt: true,
//   createdAt: true,
// })

export const insertProductCategorySchema = createInsertSchema(productCategory, {
	name: z
		.string()
		.min(1, { message: "El nombre de la categoría es requerido" })
		.max(50, {
			message: "El nombre de la categoría no puede exceder los 50 caracteres",
		}),
	isActive: z.boolean(),
	sortOrder: z.number().min(0).default(0),
	shopId: z.number(),
}).omit({
	updatedAt: true,
	createdAt: true,
});

export const createProductCategorySchema = insertProductCategorySchema.omit({
	shopId: true,
});

export const updateProductCategorySchema = insertProductCategorySchema
	.omit({ shopId: true })
	.partial();

export const reorderItemsSchema = z.array(
	z.object({
		id: z.number(),
		sortOrder: z.number().min(0),
	}),
);

export type InsertProductCategorySchema = z.infer<
	typeof insertProductCategorySchema
>;
export type CreateProductCategorySchema = z.infer<
	typeof createProductCategorySchema
>;
export type UpdateProductCategorySchema = z.infer<
	typeof updateProductCategorySchema
>;
export type ReorderItemsSchema = z.infer<typeof reorderItemsSchema>;

const SelectProductCategory = createSelectSchema(productCategory);

export type SelectProductCategory = z.infer<typeof SelectProductCategory>;

export type SelectProductWithCategory = {
	product: SelectProduct;
	product_category: SelectProductCategory;
};

// ============================================================
// MODIFIER GROUP & OPTION SCHEMAS
// ============================================================

// Modifier Option Schema
export const insertModifierOptionSchema = createInsertSchema(modifierOption, {
	name: z
		.string()
		.min(1, { message: "El nombre de la opción es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z
		.string()
		.max(200, { message: "La descripción debe ser más corta" })
		.optional(),
	priceAdjustment: z.string().default("0"),
	quantity: z.number().min(0).optional().nullable(),
	lowStockThreshold: z.number().min(0).optional().nullable(),
	isDefault: z.boolean().default(false),
	isActive: z.boolean().default(true),
	sortOrder: z.number().min(0).default(0),
}).omit({
	id: true,
	groupId: true,
	createdAt: true,
	updatedAt: true,
});

export type InsertModifierOptionSchema = z.infer<
	typeof insertModifierOptionSchema
>;

// Modifier Group Schema
export const insertModifierGroupSchema = createInsertSchema(modifierGroup, {
	name: z
		.string()
		.min(1, { message: "El nombre del grupo es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z
		.string()
		.max(200, { message: "La descripción debe ser más corta" })
		.optional(),
	minSelection: z.number().min(0).default(0),
	maxSelection: z.number().min(1).default(1),
	isActive: z.boolean().default(true),
	sortOrder: z.number().min(0).default(0),
}).omit({
	id: true,
	productId: true,
	createdAt: true,
	updatedAt: true,
});

export type InsertModifierGroupSchema = z.infer<
	typeof insertModifierGroupSchema
>;

// Schema for modifier options that can optionally include 'id' for updates
export const modifierOptionWithOptionalIdSchema =
	insertModifierOptionSchema.extend({
		id: z.number().optional(),
	});

export type ModifierOptionWithOptionalId = z.infer<
	typeof modifierOptionWithOptionalIdSchema
>;

// Schema for creating a modifier group with its options
export const createModifierGroupWithOptionsSchema = z.object({
	name: z
		.string()
		.min(1, { message: "El nombre del grupo es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z.string().max(200).optional(),
	minSelection: z.number().min(0).default(0),
	maxSelection: z.number().min(1).default(1),
	isActive: z.boolean().default(true),
	sortOrder: z.number().min(0).default(0),
	options: z.array(modifierOptionWithOptionalIdSchema).min(1, {
		message: "Debe agregar al menos una opción al grupo",
	}),
});

export type CreateModifierGroupWithOptionsSchema = z.infer<
	typeof createModifierGroupWithOptionsSchema
>;

// Input type for the form (before Zod transforms/defaults)
export type CreateModifierGroupFormInput = z.input<
	typeof createModifierGroupWithOptionsSchema
>;

// Schema for creating a product with modifier groups
export const createProductWithModifiersSchema = createProductSchema.extend({
	modifierGroups: z.array(createModifierGroupWithOptionsSchema).optional(),
});

export type CreateProductWithModifiersSchema = z.infer<
	typeof createProductWithModifiersSchema
>;

// Select schemas for modifier groups and options
const SelectModifierGroup = createSelectSchema(modifierGroup);
const SelectModifierOption = createSelectSchema(modifierOption);

export type SelectModifierGroup = z.infer<typeof SelectModifierGroup>;
export type SelectModifierOption = z.infer<typeof SelectModifierOption>;

// Type for a modifier group with its options
export type ModifierGroupWithOptions = SelectModifierGroup & {
	options: SelectModifierOption[];
};

// Type for a product with all its modifier groups and options
export type ProductWithModifiers = SelectProduct & {
	category: SelectProductCategory | null;
	modifierGroups: ModifierGroupWithOptions[];
};
