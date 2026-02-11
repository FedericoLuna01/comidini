import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../config";
import { product, productCategory } from "../schema";
import type { InsertProductCategorySchema } from "../types/product";

export const createProductCategory = async (
	data: InsertProductCategorySchema,
) => {
	const [createdCategory] = await db
		.insert(productCategory)
		.values(data)
		.returning();

	return createdCategory;
};

export const getProductCategoriesByShopId = async (shopId: number) => {
	const productCategories = await db
		.select()
		.from(productCategory)
		.where(eq(productCategory.shopId, shopId))
		.orderBy(asc(productCategory.sortOrder));

	return productCategories;
};

export const getProductCategoryById = async (categoryId: number) => {
	const [category] = await db
		.select()
		.from(productCategory)
		.where(eq(productCategory.id, categoryId));

	return category;
};

export const updateProductCategory = async (
	categoryId: number,
	data: Partial<InsertProductCategorySchema>,
) => {
	const [updatedCategory] = await db
		.update(productCategory)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(productCategory.id, categoryId))
		.returning();

	return updatedCategory;
};

export const deleteProductCategory = async (categoryId: number) => {
	// First, set categoryId to null for all products in this category
	await db
		.update(product)
		.set({ categoryId: null, updatedAt: new Date() })
		.where(eq(product.categoryId, categoryId));

	// Then delete the category
	const [deletedCategory] = await db
		.delete(productCategory)
		.where(eq(productCategory.id, categoryId))
		.returning();

	return deletedCategory;
};

export const getProductCountByCategory = async (categoryId: number) => {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(product)
		.where(eq(product.categoryId, categoryId));

	return Number(result[0]?.count) || 0;
};

export const reorderProductCategories = async (
	shopId: number,
	categoryOrders: { id: number; sortOrder: number }[],
) => {
	const categoryIds = categoryOrders.map((c) => c.id);

	// Verify all categories belong to the shop
	const categories = await db
		.select()
		.from(productCategory)
		.where(inArray(productCategory.id, categoryIds));

	const validCategoryIds = categories
		.filter((c) => c.shopId === shopId)
		.map((c) => c.id);

	// Update each category's sortOrder
	const updates = await Promise.all(
		categoryOrders
			.filter((c) => validCategoryIds.includes(c.id))
			.map((c) =>
				db
					.update(productCategory)
					.set({ sortOrder: c.sortOrder, updatedAt: new Date() })
					.where(eq(productCategory.id, c.id))
					.returning(),
			),
	);

	return updates.flat();
};
