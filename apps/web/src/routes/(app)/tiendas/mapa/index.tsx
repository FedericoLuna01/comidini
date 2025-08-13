import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Logo } from "@repo/ui/components/ui/logo";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
	AdvancedMarker,
	APIProvider,
	Map as GoogleMap,
} from "@vis.gl/react-google-maps";
import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { exampleShops } from "..";

export const Route = createFileRoute("/(app)/tiendas/mapa/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showFilters, setShowFilters] = useState(false);
	const defaultCenter = { lat: -32.9526405, lng: -60.6776039 }; // Centro de Rosario

	return (
		<div className="">
			<header className="flex items-center justify-between p-4 border-b px-8">
				<Logo />
				Avatar
			</header>
			{/* TODO: Arreglar esto (se ve bien pero hay que hacerlo sin magic number) */}
			<div className="flex h-[calc(100vh-73px)]">
				<aside className="max-w-[500px] overflow-y-auto">
					<div className="border-b sticky top-0 bg-background">
						<div className="px-6 py-4 flex flex-col gap-2">
							<Input type="text" placeholder="Buscar restaurante..." />
							<Button
								variant="outline"
								className="w-full items-center justify-start"
								onClick={() => setShowFilters(!showFilters)}
							>
								<SlidersHorizontalIcon />
								Filtros
								<Badge variant="secondary" className="ml-auto">
									4
								</Badge>
							</Button>
							<div
								className={cn(
									"transition-height duration-300 overflow-hidden",
									showFilters ? "max-h-96" : "max-h-0",
								)}
							>
								<div className="py-4 space-y-3">
									{/* TODO: usar el componente de https://ui.shadcn.com/docs/components/toggle-group */}
									<div>
										<h4>Horarios</h4>
										<Button>Abiertos ahora</Button>
										<Button>Cualquier horario</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="p-4">
						{exampleShops.map((shop) => (
							<div
								key={shop.id}
								className="flex gap-4 p-2 rounded-md hover:bg-secondary/50"
							>
								<img
									src={shop.image}
									alt={shop.name}
									className="w-48 h-48 object-cover rounded-md"
								/>
								<div>
									<h3>{shop.name}</h3>
									<p>{shop.description}</p>
								</div>
							</div>
						))}
					</div>
				</aside>
				{/* <main className="flex-1 bg-cyan-400 h-full">
					<APIProvider
						apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
						// libraries={["places", "marker"]}
						language="es"
					>
						<GoogleMap
							className="w-full h-full"
							mapId="314bbedb82bc2f8947b9d13c"
							defaultCenter={defaultCenter}
							defaultZoom={13}
							minZoom={13}
							gestureHandling={"greedy"}
							clickableIcons={false}
							disableDefaultUI={true}
						></GoogleMap>
					</APIProvider>
				</main> */}
			</div>
		</div>
	);
}
