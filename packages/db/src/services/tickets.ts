import { count, desc, eq } from "drizzle-orm";
import { db } from "../config";
import { shop, ticket } from "../schema";
import type { PaginatedResponse, PaginationParams } from "../types/pagination";
import type { InsertTicket } from "../types/ticket";

export const createTicket = async (ticketData: InsertTicket) => {
	const [createdTicket] = await db
		.insert(ticket)
		.values(ticketData)
		.returning();
	return createdTicket;
};

export const getAllTickets = async (
	params: PaginationParams = {},
): Promise<
	PaginatedResponse<{
		id: number;
		shopId: number;
		shopName: string | null;
		type: "error" | "question" | "other";
		subject: string;
		message: string;
		status: "open" | "closed" | "in_progress";
		createdAt: Date;
		updatedAt: Date;
	}>
> => {
	const { page = 1, limit = 10 } = params;
	const offset = (page - 1) * limit;

	const [tickets, totalResult] = await Promise.all([
		db
			.select({
				id: ticket.id,
				shopId: ticket.shopId,
				shopName: shop.name,
				type: ticket.type,
				subject: ticket.subject,
				message: ticket.message,
				status: ticket.status,
				createdAt: ticket.createdAt,
				updatedAt: ticket.updatedAt,
			})
			.from(ticket)
			.leftJoin(shop, eq(ticket.shopId, shop.id))
			.orderBy(desc(ticket.createdAt))
			.limit(limit)
			.offset(offset),
		db.select({ count: count() }).from(ticket),
	]);

	const total = totalResult[0]?.count ?? 0;
	const totalPages = Math.ceil(total / limit);

	return {
		data: tickets,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
};

export const getTicketById = async (ticketId: number) => {
	const [ticketData] = await db
		.select({
			id: ticket.id,
			shopId: ticket.shopId,
			shopName: shop.name,
			type: ticket.type,
			subject: ticket.subject,
			message: ticket.message,
			status: ticket.status,
			createdAt: ticket.createdAt,
			updatedAt: ticket.updatedAt,
		})
		.from(ticket)
		.leftJoin(shop, eq(ticket.shopId, shop.id))
		.where(eq(ticket.id, ticketId))
		.limit(1);

	return ticketData;
};
