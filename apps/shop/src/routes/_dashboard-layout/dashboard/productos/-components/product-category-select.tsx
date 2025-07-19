import { useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { CreateProductCategorySchema, SelectProductCategory } from "@repo/db/src/types/product"
import { toast } from "@repo/ui/components/ui/sonner"

interface ProductCategorySelectProps {
  productCategories: SelectProductCategory[] | undefined
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
  shopId?: number
}

export function ProductCategorySelect({
  productCategories,
  value,
  onChange,
  disabled,
  shopId
}: ProductCategorySelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>()
  const selectedCategory = productCategories?.find((category) => category.id === value)
  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: async (data: CreateProductCategorySchema) => {
      const response = await fetch(`http://localhost:3001/api/shops/${shopId}/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Error al crear la categoría")
      }
      return response.json()
    },
    onSuccess: (newCategory: { message: string, category: SelectProductCategory }) => {
      // Actualizar el cache de la query
      queryClient.setQueryData(
        ['productCategories', shopId],
        (oldData: SelectProductCategory[] = []) => [...oldData, newCategory.category]
      )

      // Actualizar el valor seleccionado
      setSelectedCategoryName(newCategory.category.name)
      onChange?.(newCategory.category.id)
      setOpen(false)
      setInputValue("")

      toast.success("Categoría creada exitosamente")
    },
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PopoverAnchor asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedCategory?.name ?? selectedCategoryName ?? "Seleccionar categoría..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverAnchor>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
        <Command
          filter={(value, search) => {
            if (value.includes(search)) return 1
            if (value === "create") return 1
            return 0
          }}
        >
          <CommandInput
            placeholder="Buscar o crear categoría..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <p>No se encontraron categorías.</p>
            </CommandEmpty>
            <CommandGroup
            >
              {productCategories?.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange?.(category.id)
                    setOpen(false)
                  }}
                  disabled={disabled}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {
              productCategories && inputValue.trim() && (
                <CommandGroup
                  heading="Crear nueva categoría"
                  className="border-t"
                >
                  <CommandItem
                    value="create"
                    onSelect={() => {
                      if (!inputValue.trim()) return
                      createCategory.mutate({
                        name: inputValue,
                        isActive: true,
                        sortOrder: 0
                      })
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Crear "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              )
            }
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
