import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, TrendingUp } from "lucide-react";
import { useState } from "react";
import { z } from "zod/v4";
import {
	popularProductsQueryOptions,
	type SearchProductResult,
	searchShopsQueryOptions,
} from "../../../api/search";
import { ProductSearch } from "../../../components/search";

const searchParamsSchema = z.object({
	q: z.string().optional(),
});

export const Route = createFileRoute("/(app)/buscar/")({
	component: SearchPage,
	validateSearch: searchParamsSchema,
});

function SearchPage() {
	const { q: initialQuery } = Route.useSearch();
	const [addedProduct, setAddedProduct] = useState<SearchProductResult | null>(
		null,
	);

	// Get popular products for empty state
	const { data: popularProducts, isLoading: popularLoading } = useQuery(
		popularProductsQueryOptions(undefined, 8),
	);

	// Get shops for suggestions
	const { data: shopsResult, isLoading: shopsLoading } = useQuery(
		searchShopsQueryOptions({ limit: 6 }),
	);

	const handleAddToCart = (product: SearchProductResult) => {
		setAddedProduct(product);
		// Here you would integrate with your cart logic
		console.log("Adding to cart:", product);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
					Buscar productos
				</h1>
				<p className="mt-2 text-muted-foreground">
					Encuentra los mejores productos de todas las tiendas
				</p>
			</div>

			{/* Main search component */}
			<ProductSearch
				onAddToCart={handleAddToCart}
				showShopInfo={true}
				placeholder="¿Qué estás buscando hoy?"
				className="mx-auto max-w-4xl"
				initialQuery={initialQuery || ""}
			/>

			{/* Popular Products Section */}
			<section className="mt-12">
				<div className="mb-6 flex items-center gap-2">
					<TrendingUp className="h-5 w-5 text-primary" />
					<h2 className="text-xl font-semibold">Productos destacados</h2>
				</div>
				{popularLoading ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={`skeleton-${i}`} className="overflow-hidden">
								<Skeleton className="aspect-square w-full" />
								<CardContent className="space-y-2 p-3">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
						))}
					</div>
				) : popularProducts && popularProducts.length > 0 ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
						{popularProducts.map((product) => (
							<Card
								key={product.id}
								className="overflow-hidden transition-shadow hover:shadow-md"
							>
								<div className="relative aspect-square overflow-hidden">
									<img
										src={product.images?.[0] || "/placeholder-product.jpg"}
										alt={product.name}
										className="h-full w-full object-cover transition-transform hover:scale-105"
									/>
								</div>
								<CardContent className="space-y-1 p-3">
									<h3 className="font-medium line-clamp-2 text-sm">
										{product.name}
									</h3>
									<Link
										to="/tiendas/$shopId"
										params={{ shopId: product.shopId.toString() }}
										className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
									>
										<Store className="h-3 w-3" />
										{product.shopName}
									</Link>
									<p className="font-bold text-primary">
										${Number(product.price).toFixed(2)}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				) : null}
			</section>

			{/* Shops Section */}
			<section className="mt-12">
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Store className="h-5 w-5 text-primary" />
						<h2 className="text-xl font-semibold">Tiendas populares</h2>
					</div>
					<Link to="/tiendas">
						<Button variant="ghost" size="sm">
							Ver todas
						</Button>
					</Link>
				</div>
				{shopsLoading ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={`skeleton-${i}`} className="overflow-hidden">
								<Skeleton className="aspect-square w-full" />
								<CardContent className="space-y-2 p-3">
									<Skeleton className="h-4 w-3/4" />
								</CardContent>
							</Card>
						))}
					</div>
				) : shopsResult?.shops && shopsResult.shops.length > 0 ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
						{shopsResult.shops.map((shop) => (
							<Link
								key={shop.id}
								to="/tiendas/$shopId"
								params={{ shopId: shop.id.toString() }}
							>
								<Card className="overflow-hidden transition-shadow hover:shadow-md">
									<div className="relative aspect-square overflow-hidden bg-muted">
										{shop.logo ? (
											<img
												src={shop.logo}
												alt={shop.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full items-center justify-center">
												<Store className="h-12 w-12 text-muted-foreground" />
											</div>
										)}
									</div>
									<CardContent className="p-3">
										<h3 className="font-medium line-clamp-1 text-sm">
											{shop.name}
										</h3>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				) : null}
			</section>

			{/* Toast for add to cart confirmation */}
			{addedProduct && (
				<div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
					<Card className="shadow-lg">
						<CardContent className="flex items-center gap-3 p-4">
							<div className="h-12 w-12 overflow-hidden rounded">
								<img
									src={addedProduct.images?.[0] || "/placeholder-product.jpg"}
									alt={addedProduct.name}
									className="h-full w-full object-cover"
								/>
							</div>
							<div>
								<p className="text-sm font-medium">Agregado al carrito</p>
								<p className="text-xs text-muted-foreground line-clamp-1">
									{addedProduct.name}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setAddedProduct(null)}
							>
								✕
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
