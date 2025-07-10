import { pgTable, text, timestamp, boolean, integer, serial, numeric } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const shop = pgTable("shop", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),

  // Ubicación
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),

  // Información de negocio
  businessHours: text("business_hours"), // JSON string con horarios
  deliveryRadius: integer("delivery_radius"), // en metros
  minimumOrder: numeric("minimum_order", { precision: 10, scale: 2 }),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }),

  // Configuración
  acceptsDelivery: boolean("accepts_delivery").$defaultFn(() => true),
  acceptsPickup: boolean("accepts_pickup").$defaultFn(() => true),
  acceptsReservations: boolean("accepts_reservations").$defaultFn(() => false),

  // Metadatos
  logo: text("logo"),
  banner: text("banner"),
  tags: text("tags").array(), // Array de tags/categorías

  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const shopHours = pgTable("shop_hours", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().references(() => shop.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = domingo, 1 = lunes, etc.
  openTime: text("open_time"), // formato "HH:MM"
  closeTime: text("close_time"), // formato "HH:MM"
  isClosed: boolean("is_closed").$defaultFn(() => false),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const shopCategory = pgTable("shop_category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const shopCategoryRelation = pgTable("shop_category_relation", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().references(() => shop.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => shopCategory.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});
