import { pgTable, text, timestamp, boolean, integer, serial, numeric } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { pgEnum } from "drizzle-orm/pg-core";
import { decimal } from "drizzle-orm/pg-core";
import { product, productAddon, productVariant } from "./product-schema";

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

// Estados de orden
export const orderStatusEnum = pgEnum("order_status", [
  "pending",       // Pendiente
  "confirmed",     // Confirmada
  "preparing",     // En preparación
  "ready",         // Lista
  "in_delivery",   // En entrega
  "delivered",     // Entregada
  "cancelled",     // Cancelada
  "refunded"       // Reembolsada
]);

// Métodos de pago
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",          // Efectivo
  "card",          // Tarjeta
  "transfer",      // Transferencia
]);

// Tipos de orden
export const orderTypeEnum = pgEnum("order_type", [
  "delivery",      // Entrega a domicilio
  "pickup",        // Recogida en tienda
  "dine_in"        // Comer en el lugar
]);

// Cupones de descuento
export const coupon = pgTable("coupon", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().references(() => shop.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),

  // Tipo de descuento
  discountType: text("discount_type").notNull(), // "percentage" | "fixed_amount"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),

  // Condiciones
  minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
  maximumDiscount: decimal("maximum_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"), // límite total de usos
  usageLimitPerCustomer: integer("usage_limit_per_customer"), // límite por cliente
  usedCount: integer("used_count").$defaultFn(() => 0),

  // Fechas
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),

  // Estado
  isActive: boolean("is_active").$defaultFn(() => true),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

// Órdenes/Pedidos
export const order = pgTable("order", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().references(() => shop.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => user.id, { onDelete: "set null" }),

  // Información de orden
  orderNumber: text("order_number").notNull(), // Número único de orden
  status: orderStatusEnum("status").notNull().$defaultFn(() => "pending"),
  type: orderTypeEnum("type").notNull().$defaultFn(() => "delivery"),

  // Información del cliente
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),

  // Dirección de entrega (si aplica)
  deliveryAddress: text("delivery_address"),
  deliveryCity: text("delivery_city"),
  deliveryState: text("delivery_state"),
  deliveryPostalCode: text("delivery_postal_code"),
  deliveryInstructions: text("delivery_instructions"),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),

  // Totales
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).$defaultFn(() => "0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  // Información de pago
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: text("payment_status").$defaultFn(() => "pending"), // pending, paid, failed, refunded
  paymentId: text("payment_id"), // ID de pago externo

  // Cupón aplicado
  couponId: integer("coupon_id").references(() => coupon.id, { onDelete: "set null" }),
  couponCode: text("coupon_code"),

  // Tiempos
  estimatedDeliveryTime: integer("estimated_delivery_time"), // en minutos
  scheduledFor: timestamp("scheduled_for"), // para pedidos programados

  // Notas
  notes: text("notes"),
  internalNotes: text("internal_notes"), // notas internas del negocio

  // Metadatos
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
});

// Items de la orden
export const orderItem = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => productVariant.id, { onDelete: "set null" }),

  // Información del producto en el momento de la orden
  productName: text("product_name").notNull(),
  productSku: text("product_sku"),

  // Cantidad y precios
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

  // Notas especiales para este item
  notes: text("notes"),

  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

// Complementos/extras de los items de orden
export const orderItemAddon = pgTable("order_item_addon", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull().references(() => orderItem.id, { onDelete: "cascade" }),
  addonId: integer("addon_id").notNull().references(() => productAddon.id, { onDelete: "cascade" }),

  // Información del addon en el momento de la orden
  addonName: text("addon_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Historial de estados de orden
export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Uso de cupones
export const couponUsage = pgTable("coupon_usage", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull().references(() => coupon.id, { onDelete: "cascade" }),
  orderId: integer("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => user.id, { onDelete: "set null" }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});
