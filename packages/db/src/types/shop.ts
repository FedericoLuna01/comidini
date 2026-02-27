import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";
import {
	type product,
	type productAddon,
	productCategory,
	type productVariant,
} from "../schema/product-schema";
import {
	coupon,
	couponUsage,
	order,
	orderItem,
	orderItemAddon,
	orderStatusHistory,
	shop,
	shopHours,
} from "../schema/shop-schema";

export const insertShopSchema = createInsertSchema(shop, {
	name: z
		.string()
		.min(1, { message: "El nombre es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z
		.string()
		.max(100, { message: "La descripción debe ser mas corta." })
		.optional(),
	phone: z.string().optional(),
	email: z.email("Email inválido").optional(),
	website: z.url("URL inválida").optional(),

	// Ubicación
	address: z.string().min(1, { message: "La dirección es requerida" }),
	latitude: z.string().optional(),
	longitude: z.string().optional(),

	// Información de negocio
	deliveryRadius: z
		.number()
		.int()
		.min(0, {
			message: "El radio de entrega debe ser un número entero positivo",
		})
		.optional(),
	minimumOrder: z
		.string()
		.min(0, { message: "El pedido mínimo debe ser un número positivo" })
		.optional(),
	deliveryFee: z
		.string()
		.min(0, { message: "La tarifa de entrega debe ser un número positivo" })
		.optional(),

	// Configuración
	acceptsDelivery: z.boolean(),
	acceptsPickup: z.boolean(),
	acceptsReservations: z.boolean(),

	// Pagos
	acceptsCash: z.boolean().optional(),
	cashDiscountPercentage: z.string().optional(),
	mpEnabled: z.boolean().optional(),

	logo: z.string().optional(),
	banner: z.string().optional(),
	tags: z.array(z.string()).optional(),

	userId: z.string(),
}).omit({
	updatedAt: true,
	createdAt: true,
});

export const createShopSchema = insertShopSchema.omit({
	userId: true,
});

export type InsertShop = z.infer<typeof insertShopSchema>;
export type CreateShop = z.infer<typeof createShopSchema>;
export type UpdateShop = z.infer<typeof updateShopSchema>;

export const selectShopSchema = createSelectSchema(shop);

export const updateShopSchema = createUpdateSchema(shop, {
	name: z
		.string()
		.min(1, { message: "El nombre es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z
		.string()
		.max(100, { message: "La descripción debe ser mas corta." })
		.optional(),
	phone: z.string().optional(),
	email: z.email("Email inválido").optional(),
	website: z.url("URL inválida").optional(),

	address: z.string().min(1, { message: "La dirección es requerida" }),
	latitude: z.string(),
	longitude: z.string(),
	deliveryRadius: z.number().int().min(0, {
		message: "El radio de entrega debe ser un número entero positivo",
	}),
	minimumOrder: z
		.string()
		.min(0, { message: "El pedido mínimo debe ser un número positivo" })
		.optional(),
	deliveryFee: z
		.string()
		.min(0, { message: "La tarifa de entrega debe ser un número positivo" }),
	acceptsDelivery: z.boolean(),
	acceptsPickup: z.boolean(),
	acceptsReservations: z.boolean(),

	// Pagos
	acceptsCash: z.boolean().optional(),
	cashDiscountPercentage: z.string().optional(),
	mpEnabled: z.boolean().optional(),

	logo: z.string().optional(),
	banner: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

export type SelectShop = z.infer<typeof selectShopSchema>;

export const insertShopHoursSchema = createInsertSchema(shopHours, {
	isClosed: z.boolean().default(false),
	dayOfWeek: z.number().int().min(0).max(6, {
		message:
			"El día de la semana debe ser un número entre 0 (domingo) y 6 (sábado)",
	}),
	openTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: "Hora de apertura inválida",
	}),
	closeTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: "Hora de cierre inválida",
	}),
}).omit({
	updatedAt: true,
	createdAt: true,
});

export const createShopHoursSchema = insertShopHoursSchema.omit({
	shopId: true,
});

export type InsertShopHours = z.infer<typeof insertShopHoursSchema>;
export type CreateShopHours = z.infer<typeof createShopHoursSchema>;

export const selectShopHoursSchema = createSelectSchema(shopHours);

export type SelectShopHours = z.infer<typeof selectShopHoursSchema>;

export const insertProductCategorySchema = createInsertSchema(productCategory, {
	name: z
		.string()
		.min(1, { message: "El nombre de la categoría es requerida" })
		.max(50, {
			message: "El nombre de la categoría no puede exceder los 100 caracteres",
		}),
	isActive: z.boolean().default(true),
	sortOrder: z.number().min(0).default(0),
}).omit({
	updatedAt: true,
	createdAt: true,
});

// Esquema para cupones
export const insertCouponSchema = createInsertSchema(coupon, {
	code: z
		.string()
		.min(3, { message: "El código debe tener al menos 3 caracteres" })
		.max(30, { message: "El código no puede exceder los 30 caracteres" })
		.regex(/^[A-Z0-9]+$/, {
			message: "El código solo puede contener letras mayúsculas y números",
		}),
	name: z
		.string()
		.min(1, { message: "El nombre del cupón es requerido" })
		.max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
	description: z
		.string()
		.max(500, { message: "La descripción debe ser más corta." })
		.optional(),
	discountType: z.enum(["percentage", "fixed_amount"], {
		message: "El tipo de descuento debe ser 'percentage' o 'fixed_amount'",
	}),
	discountValue: z
		.number()
		.min(0.01, { message: "El valor del descuento debe ser mayor a 0" }),
	minimumAmount: z
		.number()
		.min(0, { message: "El monto mínimo no puede ser negativo" })
		.optional(),
	maximumDiscount: z
		.number()
		.min(0, { message: "El descuento máximo no puede ser negativo" })
		.optional(),
	usageLimit: z
		.number()
		.min(1, { message: "El límite de uso debe ser mayor a 0" })
		.optional(),
	usageLimitPerCustomer: z
		.number()
		.min(1, { message: "El límite por cliente debe ser mayor a 0" })
		.optional(),
	usedCount: z
		.number()
		.min(0, { message: "El conteo de uso no puede ser negativo" })
		.default(0),
	startsAt: z.date().optional(),
	expiresAt: z.date().optional(),
	isActive: z.boolean().default(true),
}).omit({
	updatedAt: true,
	createdAt: true,
});

// Esquema para órdenes

//  TODO: Revisar necesidad de Order y envios
export const insertOrderSchema = createInsertSchema(order, {
	orderNumber: z
		.string()
		.min(1, { message: "El número de orden es requerido" }),
	status: z
		.enum(["CREATED", "PENDING_PAYMENT", "PAID", "SCANNED", "CANCELLED"])
		.default("CREATED"),
	type: z.enum(["delivery", "pickup", "dine_in"]).default("delivery"),
	customerName: z
		.string()
		.min(1, { message: "El nombre del cliente es requerido" }),
	customerEmail: z.string().email({ message: "Email inválido" }).optional(),
	customerPhone: z
		.string()
		.min(1, { message: "El teléfono del cliente es requerido" }),

	// Dirección de entrega
	deliveryAddress: z.string().optional(),
	deliveryCity: z.string().optional(),
	deliveryState: z.string().optional(),
	deliveryPostalCode: z.string().optional(),
	deliveryInstructions: z
		.string()
		.max(500, { message: "Las instrucciones son muy largas" })
		.optional(),

	// Totales
	subtotal: z.number().min(0, { message: "El subtotal no puede ser negativo" }),
	taxAmount: z
		.number()
		.min(0, { message: "El impuesto no puede ser negativo" })
		.default(0),
	deliveryFee: z
		.number()
		.min(0, { message: "La tarifa de entrega no puede ser negativa" })
		.default(0),
	discountAmount: z
		.number()
		.min(0, { message: "El descuento no puede ser negativo" })
		.default(0),
	total: z.number().min(0, { message: "El total no puede ser negativo" }),

	// Información de pago
	paymentMethod: z.enum([
		"cash",
		"card",
		"transfer",
		"digital_wallet",
		"mercadopago",
	]),
	paymentStatus: z
		.enum(["pending", "paid", "failed", "refunded"])
		.default("pending"),
	paymentId: z.string().optional(),

	// Tiempos
	estimatedDeliveryTime: z
		.number()
		.min(1, { message: "El tiempo estimado debe ser mayor a 0" })
		.optional(),

	// Notas
	notes: z
		.string()
		.max(1000, { message: "Las notas son muy largas" })
		.optional(),
	internalNotes: z
		.string()
		.max(1000, { message: "Las notas internas son muy largas" })
		.optional(),
});

// Esquema para items de orden
export const insertOrderItemSchema = createInsertSchema(orderItem, {
	productName: z
		.string()
		.min(1, { message: "El nombre del producto es requerido" }),
	productSku: z.string().optional(),
	quantity: z.number().min(1, { message: "La cantidad debe ser mayor a 0" }),
	unitPrice: z
		.number()
		.min(0, { message: "El precio unitario no puede ser negativo" }),
	totalPrice: z
		.number()
		.min(0, { message: "El precio total no puede ser negativo" }),
	notes: z
		.string()
		.max(500, { message: "Las notas son muy largas" })
		.optional(),
}).omit({
	updatedAt: true,
	createdAt: true,
});

// Esquema para complementos de items de orden
export const insertOrderItemAddonSchema = createInsertSchema(orderItemAddon, {
	addonName: z
		.string()
		.min(1, { message: "El nombre del complemento del producto es requerido" }),
	quantity: z.number().min(1, { message: "La cantidad debe ser mayor a 0" }),
	unitPrice: z
		.number()
		.min(0, { message: "El precio unitario no puede ser negativo" }),
	// TODO: Ver si el precio total es con el complemento + producto o solo del complemento
	totalPrice: z
		.number()
		.min(0, { message: "El precio total no puede ser negativo" }),
});

// Esquema para historial de estados
export const insertOrderStatusHistorySchema = createInsertSchema(
	orderStatusHistory,
	{
		status: z.enum([
			"CREATED",
			"PENDING_PAYMENT",
			"PAID",
			"SCANNED",
			"CANCELLED",
		]),
		notes: z
			.string()
			.max(1000, { message: "Las notas son muy largas" })
			.optional(),
		createdBy: z
			.string()
			.min(1, { message: "El usuario que crea el estado es requerido" }),
	},
).omit({
	createdAt: true,
});

// Esquema para uso de cupones
export const insertCouponUsageSchema = createInsertSchema(couponUsage, {
	discountAmount: z
		.number()
		.min(0, { message: "El descuento no puede ser negativo" }),
}).omit({
	createdAt: true,
});

// Tipos TypeScript para las nuevas tablas
export type ProductCategory = InferSelectModel<typeof productCategory>;
export type NewProductCategory = InferInsertModel<typeof productCategory>;

export type Product = InferSelectModel<typeof product>;
export type NewProduct = InferInsertModel<typeof product>;

export type ProductVariant = InferSelectModel<typeof productVariant>;
export type NewProductVariant = InferInsertModel<typeof productVariant>;

export type ProductAddon = InferSelectModel<typeof productAddon>;
export type NewProductAddon = InferInsertModel<typeof productAddon>;

export type Coupon = InferSelectModel<typeof coupon>;
export type NewCoupon = InferInsertModel<typeof coupon>;

export type Order = InferSelectModel<typeof order>;
export type NewOrder = InferInsertModel<typeof order>;

export type OrderItem = InferSelectModel<typeof orderItem>;
export type NewOrderItem = InferInsertModel<typeof orderItem>;

export type OrderItemAddon = InferSelectModel<typeof orderItemAddon>;
export type NewOrderItemAddon = InferInsertModel<typeof orderItemAddon>;

export type OrderStatusHistory = InferSelectModel<typeof orderStatusHistory>;
export type NewOrderStatusHistory = InferInsertModel<typeof orderStatusHistory>;

export type CouponUsage = InferSelectModel<typeof couponUsage>;
export type NewCouponUsage = InferInsertModel<typeof couponUsage>;

// Esquemas adicionales para el frontend

// Esquema para crear una orden completa con items
export const createOrderSchema = z.object({
	// Información básica de la orden
	type: z.enum(["delivery", "pickup", "dine_in"]),
	customerName: z
		.string()
		.min(1, { message: "El nombre del cliente es requerido" }),
	customerEmail: z.string().email({ message: "Email inválido" }).optional(),
	customerPhone: z
		.string()
		.min(1, { message: "El teléfono del cliente es requerido" }),

	// Items de la orden
	items: z
		.array(
			z.object({
				productId: z.number().min(1),
				variantId: z.number().optional(),
				quantity: z.number().min(1),
				notes: z.string().max(500).optional(),
				addons: z
					.array(
						z.object({
							addonId: z.number().min(1),
							quantity: z.number().min(1),
						}),
					)
					.optional(),
			}),
		)
		.min(1, { message: "Debe agregar al menos un producto" }),

	// Información de pago
	paymentMethod: z.enum(["cash", "card", "transfer", "mercadopago"]),

	// Cupón (opcional)
	couponCode: z.string().optional(),

	// Tiempos
	scheduledFor: z.date().optional(),

	// Notas
	notes: z.string().max(1000).optional(),
});

// Esquema para validar un cupón
export const validateCouponSchema = z.object({
	code: z.string().min(1, { message: "El código del cupón es requerido" }),
	shopId: z.number().min(1),
	subtotal: z.number().min(0),
	customerId: z.string().optional(),
});

// Esquema para actualizar el estado de una orden
export const updateOrderStatusSchema = z.object({
	status: z.enum([
		"CREATED",
		"PENDING_PAYMENT",
		"PAID",
		"SCANNED",
		"CANCELLED",
	]),
	notes: z.string().max(1000).optional(),
});

// Esquema para buscar productos
export const searchProductsSchema = z.object({
	shopId: z.number().min(1),
	query: z.string().min(1).optional(),
	categoryId: z.number().min(1).optional(),
	isActive: z.boolean().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

// Esquema para filtrar órdenes
export const filterOrdersSchema = z.object({
	shopId: z.number().min(1),
	status: z
		.enum(["CREATED", "PENDING_PAYMENT", "PAID", "SCANNED", "CANCELLED"])
		.optional(),
	type: z.enum(["delivery", "pickup", "dine_in"]).optional(),
	paymentMethod: z
		.enum(["cash", "card", "transfer", "digital_wallet", "mercadopago"])
		.optional(),
	paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
	customerId: z.string().optional(),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

// Esquema para estadísticas de ventas
export const salesStatsSchema = z.object({
	shopId: z.number().min(1),
	period: z.enum(["today", "week", "month", "year", "custom"]),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
});
