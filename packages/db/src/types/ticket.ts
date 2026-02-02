import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ticket } from "../schema/ticket-schema";

export const insertTicketSchema = createInsertSchema(ticket, {
	shopId: z.number().int().positive(),
	type: z.enum(["error", "question", "other"]),
	subject: z
		.string()
		.min(1, { message: "El asunto es requerido" })
		.max(200, { message: "El asunto no puede exceder los 200 caracteres" }),
	message: z
		.string()
		.min(1, { message: "El mensaje es requerido" })
		.max(2000, { message: "El mensaje no puede exceder los 2000 caracteres" }),
	status: z.enum(["open", "closed", "in_progress"]).optional(),
});

export const selectTicketSchema = createSelectSchema(ticket);

export const createTicketSchema = insertTicketSchema.omit({
	id: true,
	shopId: true,
	status: true,
	createdAt: true,
	updatedAt: true,
});

export type InsertTicket = InferInsertModel<typeof ticket>;
export type SelectTicket = InferSelectModel<typeof ticket>;
export type CreateTicket = z.infer<typeof createTicketSchema>;
