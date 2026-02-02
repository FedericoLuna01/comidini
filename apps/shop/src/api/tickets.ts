import type { CreateTicket } from "@repo/db/src/types/ticket";

const API_URL = import.meta.env.VITE_API_URL;

export async function createTicket(data: CreateTicket) {
	const response = await fetch(`${API_URL}/tickets`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Failed to create ticket");
	}

	return response.json();
}
