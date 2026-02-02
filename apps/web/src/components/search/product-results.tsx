"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Grid3X3, List, ShoppingCart, Store } from "lucide-react";
import { useState } from "react";
import type { SearchProductResult } from "../../api/search";

interface ProductResultsProps {
	products: SearchProductResult[];
	isLoading?: boolean;
	onAddToCart?: (product: SearchProductResult) => void;
	emptyMessage?: string;
	showShopInfo?: boolean;
}

type ViewMode = "grid" | "list";

export function ProductResults({
	products,
	isLoading = false,
	onAddToCart,
	emptyMessage = "No se encontraron productos",
	showShopInfo = true,
}: ProductResultsProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	if (isLoading) {
		return <ProductResultsSkeleton viewMode={viewMode} />;
	}

	if (products.length === 0) {
		return <EmptyState message={emptyMessage} />;
	}

	return (
		<div className="space-y-4">
			{/* View mode toggle */}
			<div className="flex justify-end">
				<div className="flex gap-1 rounded-lg border p-1">
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("grid")}
						className="h-8 w-8 p-0"
					>
						<Grid3X3 className="h-4 w-4" />
						<span className="sr-only">Vista de cuadrícula</span>
					</Button>
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("list")}
						className="h-8 w-8 p-0"
					>
						<List className="h-4 w-4" />
						<span className="sr-only">Vista de lista</span>
					</Button>
				</div>
			</div>

			{/* Products */}
			<div
				className={cn(
					viewMode === "grid"
						? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
						: "flex flex-col gap-4",
				)}
			>
				{products.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						viewMode={viewMode}
						onAddToCart={onAddToCart}
						showShopInfo={showShopInfo}
					/>
				))}
			</div>
		</div>
	);
}

interface ProductCardProps {
	product: SearchProductResult;
	viewMode: ViewMode;
	onAddToCart?: (product: SearchProductResult) => void;
	showShopInfo?: boolean;
}

function ProductCard({
	product,
	viewMode,
	onAddToCart,
	showShopInfo,
}: ProductCardProps) {
	const imageUrl = product.images?.[0] || "/placeholder-product.jpg";

	if (viewMode === "list") {
		return (
			<Card className="overflow-hidden transition-shadow hover:shadow-md">
				<CardContent className="flex gap-4 p-4">
					{/* Image */}
					<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
						<img
							src={imageUrl}
							alt={product.name}
							className="h-full w-full object-cover"
						/>
						{product.isFeatured && (
							<Badge
								className="absolute left-1 top-1 text-xs"
								variant="secondary"
							>
								Destacado
							</Badge>
						)}
					</div>

					{/* Info */}
					<div className="flex flex-1 flex-col justify-between">
						<div>
							<h3 className="font-semibold line-clamp-1">{product.name}</h3>
							{product.description && (
								<p className="text-sm text-muted-foreground line-clamp-2">
									{product.description}
								</p>
							)}
							{showShopInfo && (
								<Link
									to="/tiendas/$shopId"
									params={{ shopId: product.shopId.toString() }}
									className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
								>
									<Store className="h-3 w-3" />
									{product.shopName}
								</Link>
							)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-lg font-bold text-primary">
								${Number(product.price).toFixed(2)}
							</span>
							{onAddToCart && (
								<Button
									size="sm"
									onClick={() => onAddToCart(product)}
									className="gap-1"
								>
									<ShoppingCart className="h-4 w-4" />
									Agregar
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Grid view
	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<CardContent className="p-0">
				{/* Image */}
				<div className="relative aspect-square overflow-hidden">
					<img
						src={imageUrl}
						alt={product.name}
						className="h-full w-full object-cover transition-transform hover:scale-105"
					/>
					{product.isFeatured && (
						<Badge
							className="absolute left-2 top-2 text-xs"
							variant="secondary"
						>
							Destacado
						</Badge>
					)}
				</div>

				{/* Info */}
				<div className="space-y-2 p-3">
					<h3 className="font-semibold line-clamp-2 text-sm">{product.name}</h3>
					{showShopInfo && (
						<Link
							to="/tiendas/$shopId"
							params={{ shopId: product.shopId.toString() }}
							className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
						>
							<Store className="h-3 w-3" />
							<span className="line-clamp-1">{product.shopName}</span>
						</Link>
					)}
					{product.categoryName && (
						<Badge variant="outline" className="text-xs">
							{product.categoryName}
						</Badge>
					)}
					<div className="flex items-center justify-between pt-2">
						<span className="font-bold text-primary">
							${Number(product.price).toFixed(2)}
						</span>
						{onAddToCart && (
							<Button
								size="icon"
								variant="secondary"
								onClick={() => onAddToCart(product)}
								className="h-8 w-8"
							>
								<ShoppingCart className="h-4 w-4" />
								<span className="sr-only">Agregar al carrito</span>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function ProductResultsSkeleton({ viewMode }: { viewMode: ViewMode }) {
	const skeletonCount = viewMode === "grid" ? 10 : 5;

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Skeleton className="h-10 w-20" />
			</div>
			<div
				className={cn(
					viewMode === "grid"
						? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
						: "flex flex-col gap-4",
				)}
			>
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<Card key={`skeleton-${i}`} className="overflow-hidden">
						<CardContent
							className={viewMode === "list" ? "flex gap-4 p-4" : "p-0"}
						>
							<Skeleton
								className={
									viewMode === "list"
										? "h-24 w-24 rounded-lg"
										: "aspect-square w-full"
								}
							/>
							<div
								className={cn(
									"space-y-2",
									viewMode === "list" ? "flex-1" : "p-3",
								)}
							>
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
								<Skeleton className="h-6 w-20" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="rounded-full bg-muted p-4">
				<ShoppingCart className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="mt-4 text-lg font-semibold">{message}</h3>
			<p className="mt-2 text-sm text-muted-foreground">
				Intenta con otros términos de búsqueda o revisa los filtros aplicados
			</p>
		</div>
	);
}
