"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import {
	type CategoryWithCount,
	productCategoriesQueryOptions,
} from "../../api/search";

export interface SearchFilters {
	categoryId?: number;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: "relevance" | "price_asc" | "price_desc" | "name" | "newest";
}

interface SearchFiltersProps {
	filters: SearchFilters;
	onChange: (filters: SearchFilters) => void;
	shopId?: number;
}

const sortOptions = [
	{ value: "relevance", label: "Más relevantes" },
	{ value: "price_asc", label: "Precio: menor a mayor" },
	{ value: "price_desc", label: "Precio: mayor a menor" },
	{ value: "name", label: "Nombre A-Z" },
	{ value: "newest", label: "Más recientes" },
] as const;

export function SearchFiltersComponent({
	filters,
	onChange,
	shopId,
}: SearchFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

	const { data: categories, isLoading: categoriesLoading } = useQuery(
		productCategoriesQueryOptions(shopId),
	);

	const activeFiltersCount = Object.values(filters).filter(
		(v) => v !== undefined && v !== "relevance",
	).length;

	// Sync local filters when sheet opens
	const handleOpenChange = (open: boolean) => {
		if (open) {
			setLocalFilters(filters);
		}
		setIsOpen(open);
	};

	const handleApplyFilters = () => {
		onChange(localFilters);
		setIsOpen(false);
	};

	const handleClearFilters = () => {
		const clearedFilters: SearchFilters = { sortBy: "relevance" };
		setLocalFilters(clearedFilters);
		onChange(clearedFilters);
	};

	const handleCategorySelect = (categoryId: number | undefined) => {
		setLocalFilters((prev) => ({ ...prev, categoryId }));
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			{/* Sort dropdown (always visible) */}
			<Select
				value={filters.sortBy || "relevance"}
				onValueChange={(value) =>
					onChange({ ...filters, sortBy: value as SearchFilters["sortBy"] })
				}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Ordenar por" />
				</SelectTrigger>
				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Categories (desktop - visible as pills) */}
			<div className="hidden flex-wrap gap-2 md:flex">
				{categoriesLoading ? (
					<>
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-16" />
					</>
				) : (
					categories?.slice(0, 5).map((category) => (
						<CategoryPill
							key={category.id}
							category={category}
							isActive={filters.categoryId === category.id}
							onClick={() =>
								onChange({
									...filters,
									categoryId:
										filters.categoryId === category.id
											? undefined
											: category.id,
								})
							}
						/>
					))
				)}
			</div>

			{/* Filters sheet (for all filters on mobile, and advanced on desktop) */}
			<Sheet open={isOpen} onOpenChange={handleOpenChange}>
				<SheetTrigger asChild>
					<Button variant="outline" className="gap-2">
						<Filter className="h-4 w-4" />
						Filtros
						{activeFiltersCount > 0 && (
							<Badge
								variant="secondary"
								className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
							>
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
				</SheetTrigger>
				<SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle>Filtros de búsqueda</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto py-6 space-y-6">
						{/* Categories */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">Categoría</Label>
							<div className="flex flex-wrap gap-2">
								<Badge
									variant={localFilters.categoryId ? "outline" : "default"}
									className="cursor-pointer hover:opacity-80 transition-opacity"
									onClick={() => handleCategorySelect(undefined)}
								>
									Todas
								</Badge>
								{categoriesLoading ? (
									<>
										<Skeleton className="h-6 w-16" />
										<Skeleton className="h-6 w-20" />
										<Skeleton className="h-6 w-14" />
									</>
								) : (
									categories?.map((category) => (
										<Badge
											key={category.id}
											variant={
												localFilters.categoryId === category.id
													? "default"
													: "outline"
											}
											className="cursor-pointer hover:opacity-80 transition-opacity"
											onClick={() => handleCategorySelect(category.id)}
										>
											{category.name} ({category.count})
										</Badge>
									))
								)}
							</div>
						</div>

						<Separator />

						{/* Price range */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">Rango de precio</Label>
							<div className="flex items-center gap-2">
								<div className="flex-1">
									<Label
										htmlFor="minPrice"
										className="text-xs text-muted-foreground"
									>
										Mínimo
									</Label>
									<Input
										id="minPrice"
										type="number"
										placeholder="0"
										value={localFilters.minPrice || ""}
										onChange={(e) =>
											setLocalFilters((prev) => ({
												...prev,
												minPrice: e.target.value
													? Number(e.target.value)
													: undefined,
											}))
										}
									/>
								</div>
								<span className="mt-5 text-muted-foreground">-</span>
								<div className="flex-1">
									<Label
										htmlFor="maxPrice"
										className="text-xs text-muted-foreground"
									>
										Máximo
									</Label>
									<Input
										id="maxPrice"
										type="number"
										placeholder="Sin límite"
										value={localFilters.maxPrice || ""}
										onChange={(e) =>
											setLocalFilters((prev) => ({
												...prev,
												maxPrice: e.target.value
													? Number(e.target.value)
													: undefined,
											}))
										}
									/>
								</div>
							</div>
						</div>

						<Separator />

						{/* Sort by */}
						<div className="space-y-3">
							<Label className="text-sm font-medium">Ordenar por</Label>
							<Select
								value={localFilters.sortBy || "relevance"}
								onValueChange={(value) =>
									setLocalFilters((prev) => ({
										...prev,
										sortBy: value as SearchFilters["sortBy"],
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Fixed footer with actions */}
					<div className="border-t pt-4 mt-auto">
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={handleClearFilters}
								className="flex-1 gap-2"
							>
								<X className="h-4 w-4" />
								Limpiar
							</Button>
							<Button onClick={handleApplyFilters} className="flex-1">
								Aplicar filtros
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Active filter badges */}
			{activeFiltersCount > 0 && (
				<>
					{filters.minPrice !== undefined && (
						<Badge variant="secondary" className="gap-1">
							Desde ${filters.minPrice}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => onChange({ ...filters, minPrice: undefined })}
							/>
						</Badge>
					)}
					{filters.maxPrice !== undefined && (
						<Badge variant="secondary" className="gap-1">
							Hasta ${filters.maxPrice}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => onChange({ ...filters, maxPrice: undefined })}
							/>
						</Badge>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearFilters}
						className="h-7 text-xs"
					>
						Limpiar filtros
					</Button>
				</>
			)}
		</div>
	);
}

function CategoryPill({
	category,
	isActive,
	onClick,
}: {
	category: CategoryWithCount;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<Badge
			variant={isActive ? "default" : "outline"}
			className="cursor-pointer transition-colors hover:bg-primary/20"
			onClick={onClick}
		>
			{category.name}
			<span className="ml-1 text-xs opacity-70">({category.count})</span>
		</Badge>
	);
}
