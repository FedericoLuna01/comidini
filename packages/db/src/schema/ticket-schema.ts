import {
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { shop } from "./shop-schema";

export const ticketTypeEnum = pgEnum("ticket_type", [
	"error",
	"question",
	"other",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
	"open",
	"closed",
	"in_progress",
]);

export const ticket = pgTable("ticket", {
	id: serial("id").primaryKey(),
	shopId: integer("shop_id")
		.notNull()
		.references(() => shop.id, { onDelete: "cascade" }),
	type: ticketTypeEnum("type").notNull(),
	subject: text("subject").notNull(),
	message: text("message").notNull(),
	status: ticketStatusEnum("status")
		.$defaultFn(() => "open")
		.notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});
