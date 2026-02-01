import {
	boolean,
	decimal,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { shop } from "./shop-schema";

// Productos
export const product = pgTable("product", {
	id: serial("id").primaryKey(),
	shopId: integer("shop_id")
		.notNull()
		.references(() => shop.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").references(() => productCategory.id, {
		onDelete: "set null",
	}),
	name: text("name").notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	sku: text("sku"), // Stock Keeping Unit

	// Inventario
	quantity: integer("quantity").$defaultFn(() => 0),
	lowStockThreshold: integer("low_stock_threshold").$defaultFn(() => 0), // Cantidad mínima antes de considerar bajo stock

	// Media
	images: text("images").array(), // Array de URLs de imágenes

	// Configuración
	isActive: boolean("is_active").$defaultFn(() => true),
	isFeatured: boolean("is_featured").$defaultFn(() => false), // Destacar producto en la tienda

	// Metadatos
	tags: text("tags").array(),
	sortOrder: integer("sort_order").$defaultFn(() => 0),

	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// ============================================================
// MODIFIER GROUPS & OPTIONS (UberEats/DoorDash style)
// ============================================================

/**
 * Modifier Groups (e.g., "Size", "Extras", "Sauces")
 * Allows configuring min/max selections for food ordering scenarios
 */
export const modifierGroup = pgTable("modifier_group", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "cascade" }),
	name: text("name").notNull(), // e.g., "Tamaño", "Extras", "Salsas"
	description: text("description"), // Optional helper text

	// Selection rules
	minSelection: integer("min_selection").$defaultFn(() => 0), // 0 = optional, 1+ = required
	maxSelection: integer("max_selection").$defaultFn(() => 1), // 1 = single choice, 2+ = multiple

	// Configuration
	isActive: boolean("is_active").$defaultFn(() => true),
	sortOrder: integer("sort_order").$defaultFn(() => 0),

	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

/**
 * Modifier Options within a group (e.g., "Small", "Medium", "Large")
 */
export const modifierOption = pgTable("modifier_option", {
	id: serial("id").primaryKey(),
	groupId: integer("group_id")
		.notNull()
		.references(() => modifierGroup.id, { onDelete: "cascade" }),
	name: text("name").notNull(), // e.g., "Grande", "Con queso"
	description: text("description"), // Optional description

	// Pricing
	priceAdjustment: decimal("price_adjustment", {
		precision: 10,
		scale: 2,
	}).$defaultFn(() => "0"), // Can be 0 for no extra cost

	// Inventory (optional)
	quantity: integer("quantity"), // null = unlimited
	lowStockThreshold: integer("low_stock_threshold"),

	// Configuration
	isDefault: boolean("is_default").$defaultFn(() => false), // Pre-selected option
	isActive: boolean("is_active").$defaultFn(() => true),
	sortOrder: integer("sort_order").$defaultFn(() => 0),

	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// ============================================================
// LEGACY TABLES (keeping for backward compatibility)
// ============================================================

// Variantes de productos (tallas, colores, etc.) - DEPRECATED: Use modifierGroup/modifierOption
export const productVariant = pgTable("product_variant", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "cascade" }),
	name: text("name").notNull(), // ej: "Talla M", "Color Rojo"
	extraPrice: decimal("price", { precision: 10, scale: 2 }), // precio adicional/diferente
	sku: text("sku"),
	quantity: integer("quantity").$defaultFn(() => 0),
	isActive: boolean("is_active").$defaultFn(() => true),
	sortOrder: integer("sort_order").$defaultFn(() => 0),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// Complementos/Extras para productos - DEPRECATED: Use modifierGroup/modifierOption
export const productAddon = pgTable("product_addon", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.notNull()
		.references(() => product.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	isRequired: boolean("is_required").$defaultFn(() => false),
	maxQuantity: integer("max_quantity").$defaultFn(() => 1),
	isActive: boolean("is_active").$defaultFn(() => true),
	sortOrder: integer("sort_order").$defaultFn(() => 0),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// Categorías de productos (done)
export const productCategory = pgTable("product_category", {
	id: serial("id").primaryKey(),
	shopId: integer("shop_id")
		.notNull()
		.references(() => shop.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	sortOrder: integer("sort_order").$defaultFn(() => 0),
	isActive: boolean("is_active").$defaultFn(() => true),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});
