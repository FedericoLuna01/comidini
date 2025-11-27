import { eq } from "drizzle-orm";
import { db } from "../config";
import { productCategory } from "../schema";
import { InsertProductCategorySchema } from "../types/product";

export const createProductCategory = async (data: InsertProductCategorySchema) => {
  const [createdCategory] = await db
    .insert(productCategory)
    .values(data)
    .returning();

  return createdCategory;
}

export const getProductCategoriesByShopId = async (shopId: number) => {
  const productCategories = await db
    .select()
    .from(productCategory)
    .where(eq(productCategory.shopId, shopId));

  return productCategories;
}
