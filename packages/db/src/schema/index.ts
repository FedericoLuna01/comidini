import { user, session, account, verification } from "./auth-schema";
import { shop, shopHours, shopCategory, shopCategoryRelation } from "./shop-schema";

export const schema = {
  user,
  session,
  account,
  verification,
  shop,
  shopHours,
  shopCategory,
  shopCategoryRelation
} as const;

export * from "./auth-schema";
export * from "./shop-schema";