import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Beef,
	Coffee,
	Filter,
	IceCream,
	Leaf,
	MapPin,
	PhoneIcon,
	Pizza,
	Plus,
	Search,
	Store,
} from "lucide-react";
import { allShopsQueryOptions } from "../../../api/shops";
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

function RouteComponent() {
	const { data, isPending } = useQuery(allShopsQueryOptions);
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
						className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<Button variant="outline" className="flex items-center gap-2">
					<Filter className="w-4 h-4" />
					Filtros
				</Button>
			</div>

			{/* Lista de tiendas */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				{data ? (
					data.map((shop) => {
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
