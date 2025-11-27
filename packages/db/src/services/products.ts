import { eq } from "drizzle-orm";
import { db } from "../config";
import { product, productCategory } from "../schema";
import type {
	InsertProductSchema,
	UpdateProductSchema,
} from "../types/product";

export const createProduct = async (newProduct: InsertProductSchema) => {
	const [createdProduct] = await db
		.insert(product)
		.values(newProduct)
		.returning();

	return createdProduct;
};

export const getAllProductsByShopId = async (shopId: number) => {
	const products = await db
		.select()
		.from(product)
		.fullJoin(productCategory, eq(product.categoryId, productCategory.id))
		.where(eq(product.shopId, shopId));

	return products;
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
