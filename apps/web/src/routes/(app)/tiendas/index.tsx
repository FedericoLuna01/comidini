import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Clock,
	Filter,
	MapPin,
	Phone,
	Plus,
	Search,
	Store,
} from "lucide-react";

export const Route = createFileRoute("/(app)/tiendas/")({
	component: RouteComponent,
});

// Datos de ejemplo de tiendas
export const exampleShops = [
	{
		id: 1,
		name: "Pizzería Don Mario",
		type: "Pizzería",
		description:
			"Las mejores pizzas artesanales de la ciudad con ingredientes frescos y masa madre.",
		address: "Av. Corrientes 1234, CABA",
		phone: "+54 11 1234-5678",
		hours: "Lun-Dom 18:00-24:00",
		image:
			"https://images.unsplash.com/photo-1716237389072-354bcb7ab6d0?q=80&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=300&fit=crop",
		category: "restaurant",
		lat: -32.94682,
		lng: -60.63932,
	},
	{
		id: 2,
		name: "Café Central",
		type: "Café",
		description:
			"Café de especialidad con granos seleccionados y ambiente acogedor para trabajar.",
		address: "Av. Santa Fe 2567, CABA",
		phone: "+54 11 2345-6789",
		hours: "Lun-Vie 7:00-20:00",
		image:
			"https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
		category: "cafe",
		lat: -32.95123,
		lng: -60.66645,
	},
	{
		id: 3,
		name: "Heladería Artesanal",
		type: "Heladería",
		description: "Helados caseros con sabores únicos y ingredientes naturales.",
		address: "Av. Cabildo 3456, CABA",
		phone: "+54 11 3456-7890",
		hours: "Lun-Dom 14:00-23:00",
		image:
			"https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
		category: "ice-cream",
		lat: -32.95874,
		lng: -60.65012,
	},
	{
		id: 4,
		name: "Restaurante La Esquina",
		type: "Restaurante",
		description:
			"Cocina fusión con platos innovadores y una carta de vinos seleccionada.",
		address: "Calle Florida 789, CABA",
		phone: "+54 11 4567-8901",
		hours: "Mar-Dom 12:00-23:00",
		image:
			"https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400&h=300",
		category: "restaurant",
		lat: -32.94458,
		lng: -60.64123,
	},
	{
		id: 5,
		name: "Restaurante La Esquina",
		type: "Restaurante",
		description:
			"Cocina fusión con platos innovadores y una carta de vinos seleccionada.",
		address: "Calle Florida 789, CABA",
		phone: "+54 11 4567-8901",
		hours: "Mar-Dom 12:00-23:00",
		image:
			"https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400&h=300",
		category: "restaurant",
		// -32.948644, -60.647544
		lat: -32.948644,
		lng: -60.647544,
	},
	{
		id: 6,
		name: "Restaurante La Esquina",
		type: "Restaurante",
		description:
			"Cocina fusión con platos innovadores y una carta de vinos seleccionada.",
		address: "Calle Florida 789, CABA",
		phone: "+54 11 4567-8901",
		hours: "Mar-Dom 12:00-23:00",
		image:
			"https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400&h=300",
		category: "restaurant",
		// -32.944104, -60.643407
		lat: -32.944104,
		lng: -60.643407,
	},
];

function RouteComponent() {
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

				{/* CTA para registrar negocio */}
				<Link to="/registrar-negocio">
					<Button size="lg">
						<Plus className="w-5 h-5 mr-2" />
						¿Tenés un negocio?
					</Button>
				</Link>
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
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{exampleShops.map((shop) => (
					<Card
						key={shop.id}
						className="overflow-hidden hover:shadow-lg transition-shadow"
					>
						<div className="aspect-video relative">
							<img
								src={shop.image}
								alt={shop.name}
								className="w-full h-full object-cover"
							/>
							<Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">
								{shop.type}
							</Badge>
						</div>
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<CardTitle className="text-lg">{shop.name}</CardTitle>
							</div>
							<CardDescription className="text-sm">
								{shop.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin className="w-4 h-4" />
								<span className="truncate">{shop.address}</span>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock className="w-4 h-4" />
								<span>{shop.hours}</span>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Phone className="w-4 h-4" />
								<span>{shop.phone}</span>
							</div>
							<div className="flex gap-2 pt-2">
								<Button size="sm" className="flex-1">
									Ver Detalles
								</Button>
								<Button size="sm" variant="outline">
									<MapPin className="w-4 h-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Estado vacío cuando no hay resultados */}
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
	);
}
