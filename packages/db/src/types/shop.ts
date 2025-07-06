import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { shop, shopHours, shopCategory, shopCategoryRelation } from "../schema/shop-schema";

export type Shop = InferSelectModel<typeof shop>;
export type NewShop = InferInsertModel<typeof shop>;

export type ShopHours = InferSelectModel<typeof shopHours>;
export type NewShopHours = InferInsertModel<typeof shopHours>;

export type ShopCategory = InferSelectModel<typeof shopCategory>;
export type NewShopCategory = InferInsertModel<typeof shopCategory>;

export type ShopCategoryRelation = InferSelectModel<typeof shopCategoryRelation>;
export type NewShopCategoryRelation = InferInsertModel<typeof shopCategoryRelation>;

export interface ShopWithDetails extends Shop {
  hours?: ShopHours[];
  categories?: ShopCategory[];
}

export interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ShopFormData {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  deliveryRadius?: number;
  minimumOrder?: number;
  deliveryFee?: number;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  acceptsReservations: boolean;
  businessHours: BusinessHours[];
  categoryIds: string[];
} 