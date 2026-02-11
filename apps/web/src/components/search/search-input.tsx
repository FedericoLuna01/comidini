"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@repo/ui/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchSuggestionsQueryOptions } from "../../api/search";
import { useDebounce } from "../../hooks/use-debounce";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onSearch: (value: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
	showSuggestions?: boolean;
}

export function SearchInput({
	value,
	onChange,
	onSearch,
	placeholder = "Buscar productos...",
	className,
	autoFocus = false,
	showSuggestions = true,
}: SearchInputProps) {
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedValue = useDebounce(value, 300);

	// Fetch suggestions
	const { data: suggestions = [] } = useQuery({
		...searchSuggestionsQueryOptions(debouncedValue),
		enabled: showSuggestions && debouncedValue.length >= 2,
	});

	const handleSubmit = useCallback(
		(e?: React.FormEvent) => {
			e?.preventDefault();
			onSearch(value);
			setOpen(false);
		},
		[value, onSearch],
	);

	const handleSelectSuggestion = useCallback(
		(suggestion: string) => {
			onChange(suggestion);
			onSearch(suggestion);
			setOpen(false);
		},
		[onChange, onSearch],
	);

	const handleClear = useCallback(() => {
		onChange("");
		inputRef.current?.focus();
	}, [onChange]);

	// Close popover when clicking outside
	useEffect(() => {
		if (suggestions.length > 0 && value.length >= 2) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [suggestions, value]);

	return (
		<form onSubmit={handleSubmit} className={cn("relative", className)}>
			<Popover open={open && showSuggestions} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							ref={inputRef}
							type="text"
							value={value}
							onChange={(e) => onChange(e.target.value)}
							placeholder={placeholder}
							// biome-ignore lint/a11y/noAutofocus: needed for search UX
							autoFocus={autoFocus}
							className={cn(
								"h-10 w-full rounded-lg border border-input bg-background pl-10 pr-20 text-sm",
								"placeholder:text-muted-foreground",
								"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
								"disabled:cursor-not-allowed disabled:opacity-50",
							)}
						/>
						{value && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleClear}
								className="absolute right-12 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Limpiar</span>
							</Button>
						)}
						<Button
							type="submit"
							size="sm"
							className="absolute right-1 top-1/2 h-8 -translate-y-1/2"
						>
							Buscar
						</Button>
					</div>
				</PopoverTrigger>
				{showSuggestions && suggestions.length > 0 && (
					<PopoverContent
						className="w-[var(--radix-popover-trigger-width)] p-0"
						align="start"
						onOpenAutoFocus={(e) => e.preventDefault()}
					>
						<Command>
							<CommandList>
								<CommandEmpty>No se encontraron sugerencias</CommandEmpty>
								<CommandGroup heading="Sugerencias">
									{suggestions.map((suggestion) => (
										<CommandItem
											key={suggestion}
											value={suggestion}
											onSelect={() => handleSelectSuggestion(suggestion)}
										>
											<Search className="mr-2 h-4 w-4" />
											{suggestion}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				)}
			</Popover>
		</form>
	);
}
