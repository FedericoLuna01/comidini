"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export function HeroSearchBar() {
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Navigate to search page with query
		navigate({
			to: "/buscar",
			search: searchQuery ? { q: searchQuery } : undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-lg">
			<div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-xl border border-gray-100">
				<div className="flex items-center flex-1 pl-4">
					<Search className="h-5 w-5 text-gray-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="¿Qué querés comer hoy?"
						className="flex-1 ml-3 text-gray-700 placeholder-gray-400 bg-transparent border-none focus:outline-none text-lg"
					/>
				</div>
				<Button
					type="submit"
					size="lg"
					className="rounded-full px-6 gradient-comidini hover:opacity-90 text-white font-semibold"
				>
					Buscar
				</Button>
			</div>
		</form>
	);
}
