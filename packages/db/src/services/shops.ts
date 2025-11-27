import { eq } from "drizzle-orm";
import { db } from "../config";
import { shop, shopHours } from "../schema";
import { user } from "../schema/auth-schema";
import type {
	CreateShopHours,
	InsertShop,
	InsertShopHours,
} from "../types/shop";

export const getAllShops = async () => {
	const shops = await db
		.select({
			id: shop.id,
			name: shop.name,
			description: shop.description,
			phone: shop.phone,
			email: shop.email,
			address: shop.address,
			logo: shop.logo,
			acceptsDelivery: shop.acceptsDelivery,
			acceptsPickup: shop.acceptsPickup,
			createdAt: shop.createdAt,
			userId: shop.userId,
			userName: user.name,
			userEmail: user.email,
		})
		.from(shop)
		.leftJoin(user, eq(shop.userId, user.id));

	return shops;
};

export const getShopByUserId = async (userId: string) => {
	const [shopData] = await db
		.select()
		.from(shop)
		.where(eq(shop.userId, userId))
		.limit(1);

	return shopData;
};

export const createShop = async (shopData: InsertShop) => {
	const [createdShop] = await db.insert(shop).values(shopData).returning();

	return createdShop;
};

export const createManyShopHours = async (
	shopHoursValues: InsertShopHours[],
) => {
	const createdShopsHours = await db
		.insert(shopHours)
		.values(shopHoursValues)
		.returning();

	return createdShopsHours;
};

export const getShopHoursByShopId = async (shopId: number) => {
	const hoursData = await db
		.select()
		.from(shopHours)
		.where(eq(shopHours.shopId, shopId));

	return hoursData;
};

export const updateShopHours = async (
	shopId: number,
	newHoursData: CreateShopHours[],
) => {
	const existingHours = await getShopHoursByShopId(shopId);

	return await db.transaction(async (tx) => {
		// Update existing hours
		const updatedHours = await Promise.all(
			existingHours.map(async (existingHour, index) => {
				if (index < newHoursData.length) {
					const hourData = {
						...newHoursData[index],
						shopId, // Aseguramos que el shopId se mantenga
					};

					const [updated] = await tx
						.update(shopHours)
						.set(hourData)
						.where(eq(shopHours.id, existingHour.id))
						.returning();
					return updated;
				} else {
					// Remove extra existing hours
					await tx.delete(shopHours).where(eq(shopHours.id, existingHour.id));
					return null;
				}
			}),
		);

		// Add new hours if there are more new hours than existing ones
		const newHours = [];
		if (newHoursData.length > existingHours.length) {
			const additionalHours = newHoursData.slice(existingHours.length);
			const created = await tx
				.insert(shopHours)
				.values(additionalHours.map((hour) => ({ ...hour, shopId })))
				.returning();
			newHours.push(...created);
		}

		return [...updatedHours.filter(Boolean), ...newHours];
	});
};
