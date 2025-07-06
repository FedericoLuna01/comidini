import { db } from "@repo/db";
import { eq } from "drizzle-orm";
import { shop, shopHours, shopCategory, shopCategoryRelation } from "@repo/db/src/schema/shop-schema";
import { ShopOnboardingData, OnboardingStatus } from "@repo/db/src/types/shop";

/**
 * Verifica el estado del onboarding para un usuario
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const shopData = await db
    .select({
      id: shop.id,
      onboardingCompleted: shop.onboardingCompleted,
    })
    .from(shop)
    .where(eq(shop.userId, userId))
    .limit(1);

  if (shopData.length === 0) {
    return {
      userId,
      hasShop: false,
      onboardingCompleted: false,
    };
  }

  return {
    userId,
    hasShop: true,
    onboardingCompleted: shopData[0].onboardingCompleted,
    shopId: shopData[0].id,
  };
}

/**
 * Completa el onboarding para un usuario
 */
export async function completeOnboarding(userId: string, data: ShopOnboardingData) {
  // Verificar si ya existe una tienda para este usuario
  const existingShop = await db
    .select({ id: shop.id })
    .from(shop)
    .where(eq(shop.userId, userId))
    .limit(1);

  if (existingShop.length > 0) {
    throw new Error("Ya existe una tienda para este usuario");
  }


  // Crear la tienda
  const shopData = {
    userId,
    name: data.name,
    description: data.description,
    phone: data.phone,
    email: data.email,
    website: data.website,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode,
    latitude: data.latitude,
    longitude: data.longitude,
    deliveryRadius: data.deliveryRadius,
    minimumOrder: data.minimumOrder,
    deliveryFee: data.deliveryFee,
    acceptsDelivery: data.acceptsDelivery,
    acceptsPickup: data.acceptsPickup,
    acceptsReservations: data.acceptsReservations,
    onboardingCompleted: true,
  };

  await db.insert(shop).values(shopData);

  // Crear horarios de negocio si se proporcionan
  if (data.businessHours && data.businessHours.length > 0) {
    const hoursData = data.businessHours.map((hour) => ({
      shopId,
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
    }));

    await db.insert(shopHours).values(hoursData);
  }

  // Asignar categorías si se proporcionan
  if (data.categoryIds && data.categoryIds.length > 0) {
    const categoryRelations = data.categoryIds.map((categoryId) => ({
      id: generateId(),
      shopId,
      categoryId,
    }));

    await db.insert(shopCategoryRelation).values(categoryRelations);
  }

  return {
    shopId,
    message: "Onboarding completado exitosamente",
  };
}

/**
 * Obtiene las categorías disponibles para las tiendas
 */
export async function getCategories() {
  const categories = await db
    .select({
      id: shopCategory.id,
      name: shopCategory.name,
      description: shopCategory.description,
      icon: shopCategory.icon,
    })
    .from(shopCategory)
    .orderBy(shopCategory.name);

  return categories;
}

/**
 * Obtiene la información de la tienda de un usuario
 */
export async function getShopByUserId(userId: string) {
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
