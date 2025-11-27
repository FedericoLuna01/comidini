import { user, session, account, verification } from "./auth-schema";
import { shop, shopHours, shopCategory, shopCategoryRelation } from "./shop-schema";
import { product, productAddon, productCategory, productVariant } from "./product-schema";

export const schema = {
  user,
  session,
  account,
  verification,
  shop,
  shopHours,
  shopCategory,
  shopCategoryRelation,
  product,
  productAddon,
  productCategory,
  productVariant,
} as const;

export * from "./auth-schema";
export * from "./shop-schema";
export * from "./product-schema";
