import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Separator } from "@repo/ui/components/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowUpDown,
	Beef,
	Coffee,
	DollarSign,
	Filter,
	IceCream,
	Leaf,
	MapPin,
	Navigation,
	PhoneIcon,
	Pizza,
	Plus,
	Search,
	Store,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	allShopsHoursQueryOptions,
	allShopsQueryOptions,
	getShopHoursFromAll,
	isShopOpenNow,
} from "../../../api/shops";
import CardShopSkeleton from "../../../components/card-shop-skeleton";

export const Route = createFileRoute("/(app)/tiendas/")({
	component: RouteComponent,
});

// Mapa de iconos por categoría
export const categoryIconMap = {
	restaurant: Beef,
	cafe: Coffee,
	"ice-cream": IceCream,
	veggie: Leaf,
	pizza: Pizza,
} as const;

// Mapa de colores por categoría
export const categoryColorMap = {
	restaurant: {
		bg: "bg-orange-200",
		text: "text-orange-900",
		border: "border-orange-300",
	},
	cafe: {
		bg: "bg-amber-200",
		text: "text-amber-900",
		border: "border-amber-300",
	},
	"ice-cream": {
		bg: "bg-blue-200",
		text: "text-blue-900",
		border: "border-blue-300",
	},
	veggie: {
		bg: "bg-green-200",
		text: "text-green-900",
		border: "border-green-300",
	},
	pizza: {
		bg: "bg-red-200",
		text: "text-red-900",
		border: "border-red-300",
	},
} as const;

// Función helper para obtener el icono de una categoría
export const getCategoryIcon = (category: string) => {
	return categoryIconMap[category as keyof typeof categoryIconMap] || Store;
};

// Función helper para obtener los colores de una categoría
export const getCategoryColors = (category: string) => {
	return (
		categoryColorMap[category as keyof typeof categoryColorMap] || {
			bg: "bg-gray-200",
			text: "text-gray-900",
			border: "border-gray-300",
		}
	);
};

// Función para calcular distancia entre dos puntos (fórmula Haversine)
const calculateDistance = (
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
): number => {
	const R = 6371; // Radio de la Tierra en km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

// Obtener el rango de precio estimado basado en el pedido mínimo
const getPriceCategory = (
	minimumOrder: string | null,
): "low" | "medium" | "high" => {
	if (!minimumOrder) return "low";
	const value = Number.parseFloat(minimumOrder);
	if (value <= 2000) return "low";
	if (value <= 5000) return "medium";
	return "high";
};

function RouteComponent() {
	const { data, isPending } = useQuery(allShopsQueryOptions);
	const { data: allHours } = useQuery(allShopsHoursQueryOptions);

	// Estados para filtros
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"default" | "nearest" | "name">(
		"default",
	);
	const [priceFilter, setPriceFilter] = useState<
		"all" | "low" | "medium" | "high"
	>("all");
	const [showOnlyOpen, setShowOnlyOpen] = useState(false);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	// Obtener ubicación del usuario cuando se selecciona "más cercanos"
	useEffect(() => {
		if (sortBy === "nearest" && !userLocation) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						setUserLocation({
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						});
					},
					(error) => {
						console.error("Error getting location:", error);
						// Si no se puede obtener ubicación, volver al orden por defecto
						setSortBy("default");
					},
				);
			}
		}
	}, [sortBy, userLocation]);

	// Aplicar filtros y ordenamiento
	const filteredAndSortedData = useMemo(() => {
		if (!data) return [];

		let result = data.filter((shop) => {
			// Filtro de búsqueda
			const matchesSearch =
				searchQuery === "" ||
				shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
					false) ||
				(shop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ??
					false);

			// Filtro de rango de precio
			const shopPriceCategory = getPriceCategory(shop.minimumOrder);
			const matchesPrice =
				priceFilter === "all" || shopPriceCategory === priceFilter;

			// Filtro de abiertos
			let matchesOpen = true;
			if (showOnlyOpen && allHours) {
				const shopHours = getShopHoursFromAll(allHours, shop.id);
				const isOpen = shopHours.length > 0 ? isShopOpenNow(shopHours) : false;
				matchesOpen = isOpen;
			}

			return matchesSearch && matchesPrice && matchesOpen;
		});

		// Ordenamiento
		if (sortBy === "name") {
			result = result.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === "nearest" && userLocation) {
			result = result.sort((a, b) => {
				const distA =
					a.latitude && a.longitude
						? calculateDistance(
								userLocation.lat,
								userLocation.lng,
								Number.parseFloat(a.latitude),
								Number.parseFloat(a.longitude),
							)
						: Number.POSITIVE_INFINITY;
				const distB =
					b.latitude && b.longitude
						? calculateDistance(
								userLocation.lat,
								userLocation.lng,
								Number.parseFloat(b.latitude),
								Number.parseFloat(b.longitude),
							)
						: Number.POSITIVE_INFINITY;
				return distA - distB;
			});
		}

		return result;
	}, [
		data,
		searchQuery,
		sortBy,
		priceFilter,
		showOnlyOpen,
		allHours,
		userLocation,
	]);

	// Contar filtros activos
	const activeFiltersCount = [
		priceFilter !== "all",
		showOnlyOpen,
		sortBy !== "default",
	].filter(Boolean).length;

	// Limpiar todos los filtros
	const clearFilters = () => {
		setPriceFilter("all");
		setShowOnlyOpen(false);
		setSortBy("default");
		setSearchQuery("");
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">Tiendas y Restaurantes</h1>
					<p className="text-muted-foreground mt-2">
						Descubrí los mejores lugares para comer cerca tuyo
					</p>
				</div>
			</div>

			{/* Banner promocional */}
			<Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row items-center gap-4">
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-green-800 mb-2">
								¿Querés que tu negocio aparezca aquí?
							</h2>
							<p className="text-green-700">
								Registrá tu restaurante, café o negocio gastronómico de forma
								gratuita y llegá a más clientes en tu zona.
							</p>
						</div>
						<Link to="/registrar-negocio">
							<Button
								variant="outline"
								size="lg"
								className="border-green-300 text-green-700 hover:bg-green-100"
							>
								<Store className="w-4 h-4 mr-2" />
								Registrar mi Negocio
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Filtros y búsqueda */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Buscar restaurantes, cafés..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="flex items-center gap-2">
							<Filter className="w-4 h-4" />
							Filtros
							{activeFiltersCount > 0 && (
								<Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
									{activeFiltersCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-4" align="end">
						<div className="space-y-4">
							{/* Header del popover */}
							<div className="flex items-center justify-between">
								<h4 className="font-semibold text-sm">
									Filtros y ordenamiento
								</h4>
								{activeFiltersCount > 0 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearFilters}
										className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
									>
										<X className="w-3 h-3 mr-1" />
										Limpiar
									</Button>
								)}
							</div>

							<Separator />

							{/* Ordenar por */}
							<div className="space-y-2">
								<Label className="text-sm font-medium flex items-center gap-2">
									<ArrowUpDown className="w-4 h-4" />
									Ordenar por
								</Label>
								<RadioGroup
									value={sortBy}
									onValueChange={(value) => setSortBy(value as typeof sortBy)}
									className="space-y-2"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="default" id="sort-default" />
										<Label
											htmlFor="sort-default"
											className="cursor-pointer text-sm font-normal"
										>
											Por defecto
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="nearest" id="sort-nearest" />
										<Label
											htmlFor="sort-nearest"
											className="cursor-pointer text-sm font-normal flex items-center gap-1"
										>
											<Navigation className="w-3 h-3" />
											Más cercanos
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="name" id="sort-name" />
										<Label
											htmlFor="sort-name"
											className="cursor-pointer text-sm font-normal"
										>
											Nombre (A-Z)
										</Label>
									</div>
								</RadioGroup>
							</div>

							<Separator />

							{/* Rango de precio */}
							<div className="space-y-2">
								<Label className="text-sm font-medium flex items-center gap-2">
									<DollarSign className="w-4 h-4" />
									Rango de precio
								</Label>
								<RadioGroup
									value={priceFilter}
									onValueChange={(value) =>
										setPriceFilter(value as typeof priceFilter)
									}
									className="space-y-2"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="all" id="price-all" />
										<Label
											htmlFor="price-all"
											className="cursor-pointer text-sm font-normal"
										>
											Todos
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="low" id="price-low" />
										<Label
											htmlFor="price-low"
											className="cursor-pointer text-sm font-normal"
										>
											Económico
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="medium" id="price-medium" />
										<Label
											htmlFor="price-medium"
											className="cursor-pointer text-sm font-normal"
										>
											Moderado
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="high" id="price-high" />
										<Label
											htmlFor="price-high"
											className="cursor-pointer text-sm font-normal"
										>
											Premium
										</Label>
									</div>
								</RadioGroup>
							</div>

							<Separator />

							{/* Solo abiertos */}
							<div className="flex items-center justify-between">
								<Label
									htmlFor="show-open"
									className="text-sm font-medium flex items-center gap-2 cursor-pointer"
								>
									<Store className="w-4 h-4" />
									Solo abiertos ahora
								</Label>
								<button
									id="show-open"
									type="button"
									role="switch"
									aria-checked={showOnlyOpen}
									onClick={() => setShowOnlyOpen(!showOnlyOpen)}
									className={cn(
										"relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
										showOnlyOpen ? "bg-primary" : "bg-gray-200",
									)}
								>
									<span
										className={cn(
											"pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition",
											showOnlyOpen ? "translate-x-4" : "translate-x-0",
										)}
									/>
								</button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Chips de filtros activos */}
			{activeFiltersCount > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{sortBy !== "default" && (
						<Badge
							variant="secondary"
							className="flex items-center gap-1 px-2 py-1"
						>
							{sortBy === "nearest" ? "Más cercanos" : "Nombre (A-Z)"}
							<button
								type="button"
								onClick={() => setSortBy("default")}
								className="ml-1 hover:text-destructive"
							>
								<X className="w-3 h-3" />
							</button>
						</Badge>
					)}
					{priceFilter !== "all" && (
						<Badge
							variant="secondary"
							className="flex items-center gap-1 px-2 py-1"
						>
							{priceFilter === "low" && "$ Económico"}
							{priceFilter === "medium" && "$$ Moderado"}
							{priceFilter === "high" && "$$$ Premium"}
							<button
								type="button"
								onClick={() => setPriceFilter("all")}
								className="ml-1 hover:text-destructive"
							>
								<X className="w-3 h-3" />
							</button>
						</Badge>
					)}
					{showOnlyOpen && (
						<Badge
							variant="secondary"
							className="flex items-center gap-1 px-2 py-1"
						>
							Solo abiertos
							<button
								type="button"
								onClick={() => setShowOnlyOpen(false)}
								className="ml-1 hover:text-destructive"
							>
								<X className="w-3 h-3" />
							</button>
						</Badge>
					)}
				</div>
			)}

			{/* Lista de tiendas */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{filteredAndSortedData.length > 0 ? (
					filteredAndSortedData.map((shop) => {
						const shopHours = allHours
							? getShopHoursFromAll(allHours, shop.id)
							: [];
						const isOpen =
							shopHours.length > 0 ? isShopOpenNow(shopHours) : false;

						return (
							<Link
								to={`/tiendas/$shopId`}
								params={{ shopId: shop.id.toString() }}
								key={shop.id}
							>
								<Card
									key={shop.id}
									className="overflow-hidden hover:shadow-lg transition-shadow pt-0 hover:cursor-pointer h-full"
								>
									<div className="aspect-[4/3] relative">
										<img
											src={
												shop.logo ||
												"https://via.placeholder.com/400x300?text=No+Image"
											}
											alt={shop.name}
											className="w-full h-full object-cover"
										/>
										<Badge
											variant={isOpen ? "default" : "secondary"}
											className={cn(
												"absolute top-2 right-2",
												isOpen
													? "bg-green-500 hover:bg-green-600"
													: "bg-red-500 hover:bg-red-600 text-white",
											)}
										>
											{isOpen ? "Abierto" : "Cerrado"}
										</Badge>
									</div>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between">
											<CardTitle className="text-lg flex items-center gap-2 leading-tight">
												{shop.name}
											</CardTitle>
										</div>
										<CardDescription className="text-sm">
											{shop.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<MapPin className="size-5" />
											<span className="truncate w-full">{shop.address}</span>
										</div>
										{shop.phone && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<PhoneIcon className="size-5" />
												<span className="truncate w-full">{shop.phone}</span>
											</div>
										)}
									</CardContent>
								</Card>
							</Link>
						);
					})
				) : isPending ? (
					new Array(6)
						.fill(0)
						.map((_, index) => <CardShopSkeleton key={index} />)
				) : (
					<div className="col-span-full">
						<div className="text-center py-12">
							<Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-600 mb-2">
								¿No encontrás lo que buscás?
							</h3>
							<p className="text-gray-500 mb-4">
								Ayudanos a crecer nuestra comunidad gastronómica
							</p>
							<Link to="/registrar-negocio">
								<Button>
									<Plus className="w-4 h-4 mr-2" />
									Sugerir un Negocio
								</Button>
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
