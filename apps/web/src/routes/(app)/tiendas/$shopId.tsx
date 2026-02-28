import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	AdvancedMarker,
	APIProvider,
	Map as GoogleMap,
} from "@vis.gl/react-google-maps";
import { ClockIcon, ShoppingBagIcon, TruckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { allProductsByShopIdQueryOptions } from "../../../api/products";
import {
	getNextOpenTime,
	groupConsecutiveDays,
	isShopOpenNow,
	shopByIdQueryOptions,
	shopHoursQueryOptions,
} from "../../../api/shops";
import { ModifierDialog } from "../../../components/modifier-dialog";
import { ShopSearchInput } from "../../../components/search/shop-search-input";
import { ShopCartColumn } from "../../../components/shop-cart-column";
import { useDebounce } from "../../../hooks/use-debounce";
import { getCategoryColors, getCategoryIcon } from "./index";

interface ProductForCart {
	id: number;
	shopId: number;
	name: string;
	description: string | null;
	price: string;
	images: string[] | null;
}

export const Route = createFileRoute("/(app)/tiendas/$shopId")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const [selectedProduct, setSelectedProduct] = useState<ProductForCart | null>(
		null,
	);
	const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 200);

	const { data: shop, isPending } = useQuery(
		shopByIdQueryOptions(Number(params.shopId)),
	);

	const { data: products, isPending: productsPending } = useQuery(
		allProductsByShopIdQueryOptions(Number(params.shopId)),
	);

	const { data: hours } = useQuery(
		shopHoursQueryOptions(Number(params.shopId)),
	);

	const isOpen = hours ? isShopOpenNow(hours) : false;
	const nextOpen = hours && !isOpen ? getNextOpenTime(hours) : null;
	const groupedHours = hours ? groupConsecutiveDays(hours) : [];

	const categories = products?.map((product) => product.product_category.name);
	const _uniqueCategories = Array.from(new Set(categories));

	// Filter products based on search query
	const filteredProducts = useMemo(() => {
		if (!products || !debouncedSearch.trim()) return products;

		const searchLower = debouncedSearch.toLowerCase();
		return products.filter(
			(p) =>
				p.product.name.toLowerCase().includes(searchLower) ||
				p.product.description?.toLowerCase().includes(searchLower) ||
				p.product_category.name?.toLowerCase().includes(searchLower),
		);
	}, [products, debouncedSearch]);

	// Get categories that have filtered products, sorted by sortOrder
	const filteredCategories = useMemo(() => {
		if (!filteredProducts) return [];
		const catsMap = new Map<string, number>();
		for (const p of filteredProducts) {
			if (!catsMap.has(p.product_category.name)) {
				catsMap.set(p.product_category.name, p.product_category.sortOrder ?? 0);
			}
		}
		return Array.from(catsMap.entries())
			.sort((a, b) => a[1] - b[1])
			.map(([name]) => name);
	}, [filteredProducts]);

	if (isPending || productsPending) {
		return <div>Loading...</div>;
	}

	if (!shop) {
		return <div>Tienda no encontrada</div>;
	}

	console.log(products);

	// Get unique categories sorted by sortOrder
	const categoriesMap = new Map<string, { name: string; sortOrder: number }>();
	products?.forEach((p) => {
		if (p.product_category && !categoriesMap.has(p.product_category.name)) {
			categoriesMap.set(p.product_category.name, {
				name: p.product_category.name,
				sortOrder: p.product_category.sortOrder ?? 0,
			});
		}
	});

	const handleAddToCart = (product: {
		id: number;
		name: string;
		description: string | null;
		price: string;
		images: string[] | null;
	}) => {
		setSelectedProduct({
			id: product.id,
			shopId: shop.id,
			name: product.name,
			description: product.description,
			price: product.price,
			images: product.images,
		});
		setIsModifierDialogOpen(true);
	};

	const CategoryIcon = getCategoryIcon("restaurant");
	const colors = getCategoryColors("restaurant");

	return (
		<>
			<section>
				<div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-muted">
					<div className="absolute inset-0">
						<img
							src={shop?.banner || "https://via.placeholder.com/1200x400"}
							alt={shop?.name || "Restaurant Hero"}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-black/20"></div>
					</div>
					<div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pt-12 pb-8 px-4 md:px-8 flex justify-center">
						<div className="container mx-auto flex flex-col md:flex-row items-center gap-4">
							<div className="flex flex-col w-full">
								<img
									src={shop?.logo || "https://via.placeholder.com/100x100"}
									alt={shop?.name || "Shop Logo"}
									className="size-64 rounded-3xl border-4 border-white object-cover mx-auto mb-8"
								/>
								<h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-balance">
									{shop.name}
								</h1>
								<div className="flex items-center gap-2 mb-2">
									<Badge
										variant={isOpen ? "default" : "secondary"}
										className={cn(
											isOpen
												? "bg-green-500 hover:bg-green-600"
												: "bg-red-500 hover:bg-red-600 text-white",
										)}
									>
										{isOpen ? "Abierto" : "Cerrado"}
									</Badge>
									{!isOpen && nextOpen && (
										<span className="text-gray-200 text-sm">
											Abre {nextOpen.day} a las {nextOpen.time}
										</span>
									)}
								</div>
								<div className="text-gray-200 text-lg flex flex-row gap-2 items-center">
									<p>Categoría</p>
									<span>•</span>
									<p>{shop.description}</p>
									<span>•</span>
									<p>{shop.address}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-primary/5 px-4 md:px-8 py-6 border-b border-border">
					<div className="container mx-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Horarios */}
							<div className="flex gap-4 items-start">
								<ClockIcon size={24} className="text-primary flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-foreground mb-2">
										Horarios
									</h3>
									<div className="text-sm text-muted-foreground space-y-1">
										{groupedHours.length > 0 ? (
											groupedHours.map((group, idx) => (
												<div key={idx} className="flex gap-2">
													<span className="text-foreground font-medium min-w-32">
														{group.dayRange}:
													</span>
													{group.isClosed ? (
														<span className="text-muted-foreground">
															Cerrado
														</span>
													) : (
														<div className="flex flex-col">
															{group.timeSlots.map((slot, slotIdx) => (
																<span key={slotIdx}>
																	{slot.openTime} - {slot.closeTime}
																</span>
															))}
														</div>
													)}
												</div>
											))
										) : (
											<p className="text-muted-foreground">
												Horarios no disponibles
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Delivery */}
							<div className="flex gap-4 items-start">
								<TruckIcon size={24} className="text-primary flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-foreground mb-2">
										Delivery
									</h3>
									<div className="text-sm text-muted-foreground space-y-1">
										<p>
											<span className="text-green-600 font-medium">
												✓ Disponible
											</span>
										</p>
										<p>
											<span className="text-foreground font-medium">
												Costo:
											</span>{" "}
											Desde $5,000
										</p>
										<p>
											<span className="text-foreground font-medium">
												Tiempo:
											</span>{" "}
											30-45 minutos
										</p>
									</div>
								</div>
							</div>

							{/* Retiro en Local */}
							<div className="flex gap-4 items-start">
								<ShoppingBagIcon
									size={24}
									className="text-primary flex-shrink-0"
								/>
								<div>
									<h3 className="font-semibold text-foreground mb-2">
										Retiro en Local
									</h3>
									<div className="text-sm text-muted-foreground space-y-1">
										<p>
											<span className="text-green-600 font-medium">
												✓ Disponible
											</span>
										</p>
										<p>
											<span className="text-foreground font-medium">
												Tiempo:
											</span>{" "}
											15-20 minutos
										</p>
										<p>
											<span className="text-foreground font-medium">
												Lugar:
											</span>{" "}
											Mostrador principal
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<section className="container mx-auto py-8 px-4 md:px-8">
					<h2 className="text-2xl font-bold mb-4">Ubicación</h2>
					<div className="w-full h-[400px] rounded-lg overflow-hidden border border-border shadow-sm">
						<APIProvider
							apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
							language="es"
						>
							<GoogleMap
								defaultCenter={{
									lat: Number(shop.latitude),
									lng: Number(shop.longitude),
								}}
								defaultZoom={15}
								mapId="314bbedb82bc2f8947b9d13c"
								gestureHandling={"cooperative"}
							>
								<AdvancedMarker
									position={{
										lat: Number(shop.latitude),
										lng: Number(shop.longitude),
									}}
								>
									<div
										className={cn(
											"p-2 rounded-full border-2 shadow-lg",
											colors.bg,
											colors.border,
										)}
									>
										<CategoryIcon className={cn("w-6 h-6", colors.text)} />
									</div>
								</AdvancedMarker>
							</GoogleMap>
						</APIProvider>
					</div>
				</section>
				<div className="px-4 md:px-8 grid grid-cols-[300px_1fr_350px] gap-4 border-t border-border">
					{/* Sidebar de categorías */}
					<aside className="border-r border-l sticky top-[4.5rem] h-[100vh] overflow-y-auto">
						{/* Search input for shop */}
						<div className="p-4 border-b border-border">
							<ShopSearchInput
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Buscar en el menú..."
							/>
							{debouncedSearch && (
								<p className="mt-2 text-xs text-muted-foreground">
									{filteredProducts?.length || 0} producto(s) encontrado(s)
								</p>
							)}
						</div>
						{/* Categories navigation */}
						<div className="py-2">
							<p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Categorías
							</p>
							{filteredCategories?.map((category) => (
								<button
									key={category}
									type="button"
									onClick={() => {
										const element = document.getElementById(
											`category-${category.replace(/\s+/g, "-")}`,
										);
										if (element) {
											const yOffset = -100;
											const y =
												element.getBoundingClientRect().top +
												window.pageYOffset +
												yOffset;
											window.scrollTo({ top: y, behavior: "smooth" });
										}
									}}
									className="w-full text-left p-4 hover:bg-primary/5 transition-colors border-l-4 border-transparent hover:border-primary"
								>
									<h2 className="text-base font-medium text-foreground">
										{category}
									</h2>
								</button>
							))}
						</div>
					</aside>

					{/* Grid de productos por categoría */}
					<div className="p-6">
						{filteredCategories?.map((category) => {
							const categoryProducts = filteredProducts
								?.filter((p) => p.product_category?.name === category)
								.sort(
									(a, b) =>
										(a.product.sortOrder ?? 0) - (b.product.sortOrder ?? 0),
								);
							return (
								<div
									key={category}
									id={`category-${category.replace(/\s+/g, "-")}`}
									className="mb-10"
								>
									<h2 className="text-2xl font-bold mb-6 text-foreground">
										{category}
									</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{categoryProducts?.map(({ product }) => (
											<div
												key={product.id}
												className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
											>
												{/* Imagen del producto */}
												<div className="relative aspect-square bg-muted">
													<img
														src={
															product.images?.[0] ||
															"https://via.placeholder.com/200x200"
														}
														alt={product.name}
														className="w-full h-full object-cover"
													/>
													{!product.isActive && (
														<div className="absolute bottom-2 right-2">
															<span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
																No disponible
															</span>
														</div>
													)}
												</div>

												{/* Contenido */}
												<div className="p-4">
													<h3 className="font-semibold text-foreground line-clamp-2 mb-1">
														{product.name}
													</h3>
													{product.description && (
														<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
															{product.description}
														</p>
													)}
													<div className="flex items-center justify-between">
														<p className="text-lg font-bold text-foreground">
															${" "}
															{Number(product.price).toLocaleString("es-AR", {
																minimumFractionDigits: 2,
															})}
														</p>
														<Button
															size="sm"
															onClick={() => handleAddToCart(product)}
															disabled={!product.isActive}
														>
															Agregar
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>

					{/* Columna del carrito */}
					<aside className="py-6 ">
						<ShopCartColumn shopId={shop.id} />
					</aside>
				</div>{" "}
			</section>{" "}
			{/* Dialog para agregar al carrito con modificadores */}
			{selectedProduct && (
				<ModifierDialog
					productId={selectedProduct.id}
					shopId={selectedProduct.shopId}
					open={isModifierDialogOpen}
					onOpenChange={setIsModifierDialogOpen}
				/>
			)}
		</>
	);
}
