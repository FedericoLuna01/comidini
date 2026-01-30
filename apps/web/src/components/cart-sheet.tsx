import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingCart, Store, Trash2 } from "lucide-react";
import { allCartsQueryOptions, clearCartMutationOptions } from "../api/cart";

export function CartSheet() {
	const queryClient = useQueryClient();
	const { data: cartsData, isPending } = useQuery(allCartsQueryOptions);

	const clearMutation = useMutation({
		...clearCartMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-carts"] });
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			// Invalidate all cart-by-shop queries
			queryClient.invalidateQueries({
				predicate: (query) => query.queryKey[0] === "cart-by-shop",
			});
			toast.success("Carrito vaciado");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const totalItems =
		cartsData?.reduce((acc, cart) => acc + cart.items.length, 0) || 0;
	const hasItems = totalItems > 0;

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="relative">
					<ShoppingCart className="h-5 w-5" />
					{totalItems > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
						>
							{totalItems > 99 ? "99+" : totalItems}
						</Badge>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader>
					<SheetTitle className="flex items-center justify-start gap-4">
						<span>Tu Carrito</span>
						{hasItems && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => clearMutation.mutate()}
								disabled={clearMutation.isPending}
								className="text-destructive hover:text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Vaciar
							</Button>
						)}
					</SheetTitle>
					<SheetDescription>
						{hasItems
							? `Tienes productos en ${cartsData?.length} ${cartsData?.length === 1 ? "tienda" : "tiendas"}`
							: "Tu carrito está vacío"}
					</SheetDescription>
				</SheetHeader>

				{isPending ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground">Cargando...</p>
					</div>
				) : !hasItems ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-4">
						<ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
						<p className="text-muted-foreground text-center">
							Aún no has agregado productos
						</p>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto px-4">
						<div className="space-y-4 py-4">
							{cartsData?.map((cartData) => (
								<Link
									key={cartData.cart?.id}
									to="/tiendas/$shopId"
									params={{ shopId: String(cartData.shop?.id) }}
									className="block"
								>
									<div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
										{cartData.shop?.logo ? (
											<img
												src={cartData.shop.logo}
												alt={cartData.shop.name}
												className="h-12 w-12 rounded-lg object-cover"
											/>
										) : (
											<div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
												<Store className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
										<div className="flex-1">
											<h3 className="font-medium">
												{cartData.shop?.name || "Tienda"}
											</h3>
											<p className="text-sm text-muted-foreground">
												{cartData.items.length}{" "}
												{cartData.items.length === 1 ? "producto" : "productos"}
											</p>
										</div>
										<ChevronRight className="h-5 w-5 text-muted-foreground" />
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
