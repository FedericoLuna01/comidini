import { eq } from "drizzle-orm";
import { db } from "../config";
import { shop, shopHours } from "../schema";
import { InsertShop, InsertShopHours } from "../types/shop";

export const getShopByUserId = async (userId: string) => {
  const shopData = await db
    .select()
    .from(shop)
    .where(eq(shop.userId, userId))
    .limit(1);

  if (shopData.length === 0) {
    return null;
  }

  return shopData[0];
}

export const createShop = async (shopData: InsertShop) => {
  const [createdShop] = await db
    .insert(shop)
    .values(shopData)
    .returning();

  return createdShop;
}

export const createManyShopHours = async (shopHoursValues: InsertShopHours[]) => {
  const createdShopsHours = await db
    .insert(shopHours)
    .values(shopHoursValues)
    .returning();

  return createdShopsHours;
}
