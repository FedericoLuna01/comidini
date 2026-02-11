import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../config";
import {
	modifierGroup,
	modifierOption,
	product,
	productCategory,
} from "../schema";
import type {
	CreateProductWithModifiersSchema,
	InsertProductSchema,
	ModifierGroupWithOptions,
	ProductWithModifiers,
	UpdateProductSchema,
} from "../types/product";
import { createModifierGroupWithOptions } from "./modifiers";

export const createProduct = async (newProduct: InsertProductSchema) => {
	const [createdProduct] = await db
		.insert(product)
		.values(newProduct)
		.returning();

	return createdProduct;
};

/**
 * Create a product with its modifier groups and options
 */
export const createProductWithModifiers = async (
	data: CreateProductWithModifiersSchema & { shopId: number },
): Promise<ProductWithModifiers | null> => {
	const { modifierGroups, ...productData } = data;

	// Create the product
	const [createdProduct] = await db
		.insert(product)
		.values(productData)
		.returning();

	if (!createdProduct) {
		return null;
	}

	// Create modifier groups if provided
	const createdGroups: ModifierGroupWithOptions[] = [];
	if (modifierGroups && modifierGroups.length > 0) {
		for (const groupData of modifierGroups) {
			const group = await createModifierGroupWithOptions(
				createdProduct.id,
				groupData,
			);
			if (group) {
				createdGroups.push(group);
			}
		}
	}

	// Get category if exists
	let category = null;
	if (createdProduct.categoryId) {
		const [cat] = await db
			.select()
			.from(productCategory)
			.where(eq(productCategory.id, createdProduct.categoryId));
		category = cat || null;
	}

	return {
		...createdProduct,
		category,
		modifierGroups: createdGroups,
	};
};

export const getAllProductsByShopId = async (shopId: number) => {
	const products = await db
		.select()
		.from(product)
		.fullJoin(productCategory, eq(product.categoryId, productCategory.id))
		.where(eq(product.shopId, shopId));

	return products;
};

/**
 * Get product by ID with full modifier hierarchy
 */
export const getProductByIdWithModifiers = async (
	productId: number,
): Promise<ProductWithModifiers | null> => {
	const [foundProduct] = await db
		.select()
		.from(product)
		.where(eq(product.id, productId));

	if (!foundProduct) {
		return null;
	}

	// Get category
	let category = null;
	if (foundProduct.categoryId) {
		const [cat] = await db
			.select()
			.from(productCategory)
			.where(eq(productCategory.id, foundProduct.categoryId));
		category = cat || null;
	}

	// Get all modifier groups for this product
	const groups = await db
		.select()
		.from(modifierGroup)
		.where(eq(modifierGroup.productId, productId))
		.orderBy(asc(modifierGroup.sortOrder));

	// Get all options for all groups
	const modifierGroupsWithOptions: ModifierGroupWithOptions[] = [];

	for (const group of groups) {
		const options = await db
			.select()
			.from(modifierOption)
			.where(eq(modifierOption.groupId, group.id))
			.orderBy(asc(modifierOption.sortOrder));

		modifierGroupsWithOptions.push({
			...group,
			options,
		});
	}

	return {
		...foundProduct,
		category,
		modifierGroups: modifierGroupsWithOptions,
	};
};

export const getProductById = async (productId: number) => {
	const [foundProduct] = await db
		.select()
		.from(product)
		.leftJoin(productCategory, eq(product.categoryId, productCategory.id))
		.where(eq(product.id, productId));

	return foundProduct;
};

export const updateProduct = async (
	productId: number,
	updatedProduct: UpdateProductSchema,
) => {
	const [updated] = await db
		.update(product)
		.set({
			...updatedProduct,
			updatedAt: new Date(),
		})
		.where(eq(product.id, productId))
		.returning();

	return updated;
};

export const deleteProductById = async (productId: number) => {
	await db.delete(product).where(eq(product.id, productId));
};

export const reorderProducts = async (
	shopId: number,
	productOrders: { id: number; sortOrder: number }[],
) => {
	const productIds = productOrders.map((p) => p.id);

	// Verify all products belong to the shop
	const products = await db
		.select()
		.from(product)
		.where(inArray(product.id, productIds));

	const validProductIds = products
		.filter((p) => p.shopId === shopId)
		.map((p) => p.id);

	// Update each product's sortOrder
	const updates = await Promise.all(
		productOrders
			.filter((p) => validProductIds.includes(p.id))
			.map((p) =>
				db
					.update(product)
					.set({ sortOrder: p.sortOrder, updatedAt: new Date() })
					.where(eq(product.id, p.id))
					.returning(),
			),
	);

	return updates.flat();
};
