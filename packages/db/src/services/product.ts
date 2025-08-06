import { db } from "../config";
import { product } from "../schema";
import { CreateProductSchema, InsertProductSchema } from "../types/product";

export const createProduct = async (newProduct: InsertProductSchema) => {
  const [createdProduct] = await db
    .insert(product)
    .values(newProduct)
    .returning();

  return createdProduct;
}
