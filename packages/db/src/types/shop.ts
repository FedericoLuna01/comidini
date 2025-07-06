import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { shop, shopHours, shopCategory, shopCategoryRelation } from "../schema/shop-schema";
import { z } from "zod";

export type Shop = InferSelectModel<typeof shop>;
export type NewShop = InferInsertModel<typeof shop>;

export type ShopHours = InferSelectModel<typeof shopHours>;
export type NewShopHours = InferInsertModel<typeof shopHours>;

export type ShopCategory = InferSelectModel<typeof shopCategory>;
export type NewShopCategory = InferInsertModel<typeof shopCategory>;

export type ShopCategoryRelation = InferSelectModel<typeof shopCategoryRelation>;
export type NewShopCategoryRelation = InferInsertModel<typeof shopCategoryRelation>;

// Schema para el onboarding de tiendas
export const shopOnboardingSchema = z.object({
  // Información básica
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  website: z.string().url("URL inválida").optional(),

  // Ubicación
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  country: z.string().min(1, "El país es requerido"),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Información de negocio
  deliveryRadius: z.number().min(0, "El radio de entrega debe ser mayor a 0").optional(),
  minimumOrder: z.number().min(0, "El pedido mínimo debe ser mayor o igual a 0").optional(),
  deliveryFee: z.number().min(0, "La tarifa de entrega debe ser mayor o igual a 0").optional(),

  // Configuración
  acceptsDelivery: z.boolean(),
  acceptsPickup: z.boolean(),
  acceptsReservations: z.boolean(),

  // Horarios de negocio (opcional para el onboarding)
  businessHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)").optional(),
    closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)").optional(),
    isClosed: z.boolean(),
  })).optional(),

  // Categorías (opcional para el onboarding)
  categoryIds: z.array(z.string()).optional(),
});
