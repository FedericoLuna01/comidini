import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ExternalLinkIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import {
	allShopsHoursQueryOptions,
	allShopsQueryOptions,
	getNextOpenTime,
	getShopHoursFromAll,
	isShopOpenNow,
} from "../../../../api/shops";
import { MapComponent } from "./-components/map-component";
import { useShopStore } from "./-store/shop-store";

export const Route = createFileRoute("/(app)/tiendas/mapa/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showFilters, setShowFilters] = useState(false);
	const { selectedShopId, toggleSelectedShop } = useShopStore();

	const { data: shops, isPending } = useQuery(allShopsQueryOptions);
	const { data: allHours } = useQuery(allShopsHoursQueryOptions);

	console.log(shops);

	return (
		<div className="">
			{/* TODO: Arreglar esto (se ve bien pero hay que hacerlo sin magic number) */}
			<div className="flex h-[calc(100vh-73px)]">
				<aside className="w-[500px] overflow-hidden flex flex-col border-r">
					<div className="border-b">
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
					<div className="p-4 overflow-y-auto h-full flex flex-col gap-4">
						{isPending &&
							new Array(4).fill(0).map((_, index) => (
								<div key={index} className="flex flex-row gap-4">
									<Skeleton className="size-36 aspect-square" />
									<div className="flex flex-col w-full">
										<Skeleton className="h-6 w-3/4 mb-2" />
										<Skeleton className="h-4 w-1/2 mb-2" />
										<Skeleton className="h-4 w-full mb-2" />
										<Skeleton className="h-4 w-5/6 mb-2" />
									</div>
								</div>
							))}
						{!isPending && shops?.length === 0 && (
							<p>No hay tiendas disponibles.</p>
						)}
						{!isPending &&
							shops?.map((shop) => {
								const shopHours = allHours
									? getShopHoursFromAll(allHours, shop.id)
									: [];
								const isOpen =
									shopHours.length > 0 ? isShopOpenNow(shopHours) : false;
								const nextOpen =
									shopHours.length > 0 && !isOpen
										? getNextOpenTime(shopHours)
										: null;

								return (
									<button
										type="button"
										key={shop.id}
										className={cn(
											"flex gap-4 p-2 rounded-md hover:bg-secondary/50 items-start text-left cursor-pointer transition-colors",
											selectedShopId === shop.id && "bg-secondary ",
										)}
										onClick={() =>
											toggleSelectedShop(shop.id, {
												lat: Number(shop.latitude) + 0.01, // Adjust latitude to move the focus slightly upwards
												lng: Number(shop.longitude),
											})
										}
									>
										<div className="relative aspect-square size-36">
											<img
												src={shop.logo || "https://via.placeholder.com/150"}
												alt={shop.name}
												className="w-full h-full object-cover rounded-md"
											/>
										</div>
										<div className="flex flex-col gap-2">
											<div className="flex flex-col">
												<div className="flex flex-row items-center">
													<h3 className="text-lg leading-5 font-semibold">
														{shop.name}
													</h3>
													<Button
														asChild
														size="icon"
														variant="outline"
														className="ml-auto"
													>
														<Link
															to="/tiendas/$shopId"
															params={{ shopId: shop.id.toString() }}
														>
															<ExternalLinkIcon className="size-4" />
														</Link>
													</Button>
												</div>
												<p className="text-muted-foreground text-sm">
													Categoría
												</p>
											</div>
											<p className="text-muted-foreground text-sm">
												{shop.address}
											</p>
											<p className="text-sm">
												{isOpen ? (
													<span className="text-green-500">Abierto</span>
												) : (
													<>
														<span className="text-red-500">Cerrado</span>
														{nextOpen && (
															<>
																{" "}
																• Abre {nextOpen.day} a las {nextOpen.time}
															</>
														)}
													</>
												)}
											</p>
											{shop.acceptsDelivery && (
												<Badge className="bg-emerald-300/20 text-emerald-600">
													Delivery
												</Badge>
											)}
										</div>
									</button>
								);
							})}
					</div>
				</aside>
				<main className="flex-1 h-full flex items-center justify-center">
					<APIProvider
						apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
						language="es"
					>
						<MapComponent shops={shops} />
					</APIProvider>
				</main>
			</div>
		</div>
	);
}
