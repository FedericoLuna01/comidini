import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@repo/ui/components/ui/command";
import { Input } from "@repo/ui/components/ui/input";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@repo/ui/components/ui/popover";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Command as CommandPrimitive } from "cmdk";
import { useState } from "react";

type AutoCompleteInputProps = {
	value: string;
	onChange: (value: string) => void;
	onSelect: (suggestion: google.maps.places.AutocompleteSuggestion) => void;
	suggestions: google.maps.places.AutocompleteSuggestion[];
	isLoading?: boolean;
	emptyMessage?: string;
	placeholder?: string;
};

const AutoCompleteInput = ({
	value,
	onChange,
	onSelect,
	suggestions,
	isLoading,
}: AutoCompleteInputProps) => {
	const [isOpen, setIsOpen] = useState(false);
	// TODO: pulir este componente para que no se rompa el foco al abrir el popover

	return (
		<div>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<Command shouldFilter={false} className="w-full">
					<PopoverAnchor asChild>
						<CommandPrimitive.Input asChild>
							<Input
								placeholder="Buscar dirección..."
								value={value}
								onChange={(e) => {
									onChange(e.target.value);
									setIsOpen(true);
								}}
								onFocus={() => setIsOpen(true)}
							/>
						</CommandPrimitive.Input>
					</PopoverAnchor>
					<PopoverContent
						asChild
						onOpenAutoFocus={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						className="w-[var(--radix-popper-anchor-width)] p-0"
					>
						<CommandList>
							{value && isLoading && (
								<CommandPrimitive.Loading>
									<div className="p-1 space-y-1">
										<Skeleton className="h-6 w-full" />
										<Skeleton className="h-6 w-full" />
									</div>
								</CommandPrimitive.Loading>
							)}
							{value && suggestions.length > 0 && !isLoading ? (
								<CommandGroup>
									{suggestions.map((suggestion, index) => (
										<CommandItem
											key={index}
											onSelect={() => {
												onSelect(suggestion);
												setIsOpen(false);
											}}
											onMouseDown={(e) => e.preventDefault()}
										>
											{suggestion.placePrediction?.text.text}
										</CommandItem>
									))}
								</CommandGroup>
							) : null}
							{value && !isLoading && suggestions.length === 0 ? (
								<CommandEmpty>No se encontraron resultados.</CommandEmpty>
							) : null}
						</CommandList>
					</PopoverContent>
				</Command>
			</Popover>
		</div>
	);
};

export { AutoCompleteInput };
