import { account, session, user, verification } from "./auth-schema";
import { cart, cartItem, cartItemAddon, cartItemModifier } from "./cart-schema";
import {
	modifierGroup,
	modifierOption,
	product,
	productAddon,
	productCategory,
	productVariant,
} from "./product-schema";
import {
	coupon,
	couponUsage,
	order,
	orderItem,
	orderItemAddon,
	orderItemModifier,
	orderStatusHistory,
	shop,
	shopCategory,
	shopCategoryRelation,
	shopHours,
} from "./shop-schema";

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
	modifierGroup,
	modifierOption,
	cart,
	cartItem,
	cartItemAddon,
	cartItemModifier,
	order,
	orderItem,
	orderItemAddon,
	orderItemModifier,
	orderStatusHistory,
	coupon,
	couponUsage,
} as const;

export * from "./auth-schema";
export * from "./cart-schema";
export * from "./product-schema";
export * from "./shop-schema";
