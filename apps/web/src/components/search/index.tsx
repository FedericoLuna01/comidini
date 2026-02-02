"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
	type SearchProductResult,
	type SearchProductsParams,
	searchProductsQueryOptions,
} from "../../api/search";
import { ProductResults } from "./product-results";
import { type SearchFilters, SearchFiltersComponent } from "./search-filters";
import { SearchInput } from "./search-input";

interface ProductSearchProps {
	/** Optional shop ID to limit search to a specific shop */
	shopId?: number;
	/** Callback when a product is added to cart */
	onAddToCart?: (product: SearchProductResult) => void;
	/** Initial search query */
	initialQuery?: string;
	/** Whether to show shop info on product cards */
	showShopInfo?: boolean;
	/** Placeholder text for the search input */
	placeholder?: string;
	/** Custom class for the container */
	className?: string;
}

export function ProductSearch({
	shopId,
	onAddToCart,
	initialQuery = "",
	showShopInfo = true,
	placeholder,
	className,
}: ProductSearchProps) {
	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
	const [filters, setFilters] = useState<SearchFilters>({
		sortBy: "relevance",
	});
	const [page, setPage] = useState(0);
	const pageSize = 20;

	// Build search params
	const searchParams: SearchProductsParams = useMemo(
		() => ({
			query: submittedQuery || undefined,
			shopId,
			categoryId: filters.categoryId,
			minPrice: filters.minPrice,
			maxPrice: filters.maxPrice,
			sortBy: filters.sortBy,
			limit: pageSize,
			offset: page * pageSize,
		}),
		[submittedQuery, shopId, filters, page],
	);

	// Fetch products
	const {
		data: searchResult,
		isLoading,
		isFetching,
	} = useQuery(searchProductsQueryOptions(searchParams));

	const handleSearch = useCallback((query: string) => {
		setSubmittedQuery(query);
		setPage(0); // Reset to first page on new search
	}, []);

	const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
		setFilters(newFilters);
		setPage(0); // Reset to first page on filter change
	}, []);

	const handleLoadMore = useCallback(() => {
		setPage((prev) => prev + 1);
	}, []);

	const products = searchResult?.products || [];
	const hasMore = searchResult?.hasMore || false;
	const total = searchResult?.total || 0;

	return (
		<div className={className}>
			<div className="space-y-4">
				{/* Search input */}
				<SearchInput
					value={searchQuery}
					onChange={setSearchQuery}
					onSearch={handleSearch}
					placeholder={
						placeholder ||
						(shopId ? "Buscar en esta tienda..." : "Buscar productos...")
					}
					className="w-full"
				/>

				{/* Filters */}
				<SearchFiltersComponent
					filters={filters}
					onChange={handleFiltersChange}
					shopId={shopId}
				/>

				{/* Results count */}
				{submittedQuery && !isLoading && (
					<p className="text-sm text-muted-foreground">
						{total === 0
							? "No se encontraron resultados"
							: `${total} producto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
						{submittedQuery && (
							<span>
								{" "}
								para <strong>"{submittedQuery}"</strong>
							</span>
						)}
					</p>
				)}

				{/* Product results */}
				<ProductResults
					products={products}
					isLoading={isLoading}
					onAddToCart={onAddToCart}
					showShopInfo={showShopInfo && !shopId}
					emptyMessage={
						submittedQuery
							? `No se encontraron productos para "${submittedQuery}"`
							: "Busca productos para comenzar"
					}
				/>

				{/* Load more button */}
				{hasMore && (
					<div className="flex justify-center pt-4">
						<Button
							variant="outline"
							onClick={handleLoadMore}
							disabled={isFetching}
							className="gap-2"
						>
							{isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
							Cargar más productos
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export { ProductResults } from "./product-results";
export type { SearchFilters as SearchFiltersType } from "./search-filters";
export { SearchFiltersComponent as SearchFilters } from "./search-filters";
export { SearchInput } from "./search-input";
export { ShopSearchInput } from "./shop-search-input";
