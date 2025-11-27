import { db } from "../config";
import { product, productCategory } from "../schema";
import { InsertProductSchema } from "../types/product";
import { eq } from "drizzle-orm";

export const createProduct = async (newProduct: InsertProductSchema) => {
  const [createdProduct] = await db
    .insert(product)
    .values(newProduct)
    .returning();

  return createdProduct;
}

export const getAllProductsByShopId = async (shopId: number) => {
  const products = await db
    .select()
    .from(product)
    .fullJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(eq(product.shopId, shopId))

  return products;
};
