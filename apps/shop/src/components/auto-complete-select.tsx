import { Input } from "@repo/ui/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@repo/ui/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@repo/ui/components/ui/command"
import { useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Skeleton } from "@repo/ui/components/ui/skeleton"

type AutoCompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: google.maps.places.AutocompleteSuggestion) => void;
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
}

const AutoCompleteInput = ({
  value,
  onChange,
  onSelect,
  suggestions,
  isLoading,
  emptyMessage = "No hay resultados.",
  placeholder = "Ingresa una dirección...",
}: AutoCompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Command
          shouldFilter={false}
          className="w-full"
        >
          <PopoverAnchor
            asChild
          >
            <CommandPrimitive.Input
              asChild
            >
              <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
              />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[var(--radix-popper-anchor-width)] p-0"
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {suggestions.length > 0 && !isLoading ? (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        onSelect(suggestion)
                        setIsOpen(false)
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {suggestion.placePrediction?.text.text}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading && suggestions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  )
}

export {
  AutoCompleteInput
}
