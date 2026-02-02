import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export interface TicketListItem {
	id: number;
	shopId: number;
	shopName: string | null;
	type: "error" | "question" | "other";
	subject: string;
	message: string;
	status: "open" | "closed" | "in_progress";
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedTicketsResponse {
	data: TicketListItem[];
	pagination: PaginationInfo;
}

export interface TicketQueryParams {
	page?: number;
	limit?: number;
}

const getTickets = async (
	params: TicketQueryParams = {},
): Promise<PaginatedTicketsResponse> => {
	const { page = 1, limit = 10 } = params;
	const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	const response = await fetch(`${API_URL}/tickets?${searchParams}`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch tickets");
	}

	return response.json();
};

export const ticketsQueryOptions = (params: TicketQueryParams = {}) =>
	queryOptions({
		queryKey: ["get-tickets", params.page ?? 1, params.limit ?? 10],
		queryFn: () => getTickets(params),
	});

// Mantener para compatibilidad hacia atrás
export const allTicketsQueryOptions = ticketsQueryOptions();
