import { shop } from "../schema/shop-schema";
import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";

export const insertShopSchema = createInsertSchema(shop, {
  name: z.string()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
  description: z.string().max(100, { message: "La descripción debe ser mas corta." }).optional(),
  phone: z.string().optional(),
  email: z.email("Email inválido").optional(),
  website: z.url("URL inválida").optional(),

  // Ubicación
  address: z.string().min(1, { message: "La dirección es requerida" }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),

  // Información de negocio
  businessHours: z.string().optional(), // JSON string con horarios
  deliveryRadius: z.number().int().min(0, { message: "El radio de entrega debe ser un número entero positivo" }).optional(),
  minimumOrder: z.string().min(0, { message: "El pedido mínimo debe ser un número positivo" }).optional(),
  deliveryFee: z.string().min(0, { message: "La tarifa de entrega debe ser un número positivo" }).optional(),

  // Configuración
  acceptsDelivery: z.boolean(),
  acceptsPickup: z.boolean(),
  acceptsReservations: z.boolean(),

  // Metadatos
  logo: z.string().optional(),
  banner: z.string().optional(),
  tags: z.array(z.string()).optional(),

  userId: z.string(),
}).omit({
  updatedAt: true,
  createdAt: true,
})

export const createShopSchema = insertShopSchema.omit({
  userId: true,
})

export type InsertShop = z.infer<typeof insertShopSchema>;
export type CreateShop = z.infer<typeof createShopSchema>;

