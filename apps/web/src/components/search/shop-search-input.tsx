"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface ShopSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function ShopSearchInput({
	value,
	onChange,
	placeholder = "Buscar en este menú...",
	className,
}: ShopSearchInputProps) {
	const [isFocused, setIsFocused] = useState(false);

	const handleClear = () => {
		onChange("");
	};

	return (
		<div className={cn("relative", className)}>
			<Search
				className={cn(
					"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
					isFocused ? "text-primary" : "text-muted-foreground",
				)}
			/>
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				placeholder={placeholder}
				className={cn(
					"h-10 pl-10 pr-8",
					isFocused && "ring-2 ring-primary ring-offset-2",
				)}
			/>
			{value && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleClear}
					className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Limpiar búsqueda</span>
				</Button>
			)}
		</div>
	);
}
