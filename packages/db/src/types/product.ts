import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { product, productAddon, productCategory, productVariant } from "../schema";

export const insertProductSchema = createInsertSchema(product, {
  name: z.string()
    .min(1, { message: "El nombre del producto es requerido" })
    .max(100, { message: "El nombre del producto no puede exceder los 100 caracteres" }),
  description: z.string().max(100, { message: "La descripción debe ser mas corta." }).optional(),
  price: z.string(),
  // price: z.string(),
  sku: z.string().min(1, { message: "El SKU es requerido" }).max(50, { message: "El SKU no puede exceder los 50 caracteres" }),
  quantity: z.number().min(0, { message: "La cantidad de productos no puede ser negativo" }),
  lowStockThreshold: z.number().min(0),
  images: z.array(z.string({ message: "La imagen debe ser una URL válida" })).min(1, { message: "Se requiere al menos una imagen" }),
  categoryId: z.number({ message: "La categoría es requerida" }).min(0, { message: "La categoría es requerida" }),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().min(0),
  shopId: z.number()
}).omit({
  updatedAt: true,
  createdAt: true,
  id: true,
})

export const createProductSchema = insertProductSchema.omit({
  shopId: true,
})

export type InsertProductSchema = z.infer<typeof insertProductSchema>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const insertProductVariantSchema = createInsertSchema(productVariant, {
  name: z.string()
    .min(1, { message: "El nombre de la variante es requerido" })
    .max(50, { message: "El nombre de la variante no puede exceder los 50 caracteres" }),
  extraPrice: z.number().min(0, { message: "El precio adicional no puede ser negativo" }).optional(),
  sku: z.string().min(1, { message: "El SKU es requerido" }).max(50, { message: "El SKU no puede exceder los 50 caracteres" }),
  quantity: z.number().min(0, { message: "La cantidad no puede ser negativa" }).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
}).omit({
  updatedAt: true,
  createdAt: true,
})

export const insertProductAddonSchema = createInsertSchema(productAddon, {
  name: z.string()
    .min(1, { message: "El nombre del complemento es requerido" })
    .max(50, { message: "El nombre del complemento no puede exceder los 50 caracteres" }),
  description: z.string().max(200, { message: "La descripción debe ser más corta." }).optional(),
  price: z.number().min(0, { message: "El precio no puede ser negativo" }),
  isRequired: z.boolean().default(false),
  maxQuantity: z.number().min(1, { message: "La cantidad máxima debe ser mayor a 0" }).default(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
}).omit({
  updatedAt: true,
  createdAt: true,
})

export const insertProductCategorySchema = createInsertSchema(productCategory, {
  name: z.string()
    .min(1, { message: "El nombre de la categoría es requerido" })
    .max(50, { message: "El nombre de la categoría no puede exceder los 50 caracteres" }),
  isActive: z.boolean(),
  sortOrder: z.number().min(0).default(0),
  shopId: z.number()
}).omit({
  updatedAt: true,
  createdAt: true,
})

export const createProductCategorySchema = insertProductCategorySchema.omit({
  shopId: true,
});

export type InsertProductCategorySchema = z.infer<typeof insertProductCategorySchema>;
export type CreateProductCategorySchema = z.infer<typeof createProductCategorySchema>;

const SelectProductCategory = createSelectSchema(productCategory)

export type SelectProductCategory = z.infer<typeof SelectProductCategory>;
