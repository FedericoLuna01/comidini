import { authClient } from "@repo/auth/client";
import { Badge } from "@repo/ui/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Package, Truck } from "lucide-react";
import { myOrdersQueryOptions, type Order } from "../api/orders";

const ACTIVE_STATUSES = new Set([
	"CREATED",
	"PENDING_PAYMENT",
	"PAID",
	"PREPARING",
	"READY",
]);

const STATUS_LABEL: Record<string, string> = {
	CREATED: "Creado",
	PENDING_PAYMENT: "Pago pendiente",
	PAID: "Pagado",
	PREPARING: "Preparando",
	READY: "Listo para retirar",
};

const STATUS_ICON: Record<
	string,
	React.ComponentType<{ className?: string }>
> = {
	CREATED: Package,
	PENDING_PAYMENT: Clock,
	PAID: Package,
	PREPARING: Truck,
	READY: Package,
};

function ActiveOrderItem({ order }: { order: Order }) {
	const Icon = STATUS_ICON[order.status] ?? Package;

	return (
		<Link
			to="/pedido/$orderId"
			params={{ orderId: String(order.id) }}
			className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors group"
		>
			<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
				<Icon className="h-4 w-4 text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">
					{order.shopName ?? `Pedido #${order.orderNumber}`}
				</p>
				<p className="text-xs text-muted-foreground">
					{STATUS_LABEL[order.status] ?? order.status} &middot; $
					{Number.parseFloat(order.total).toLocaleString("es-AR", {
						minimumFractionDigits: 2,
					})}
				</p>
			</div>
			<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
		</Link>
	);
}

export function ActiveOrdersBanner() {
	const { data: session } = authClient.useSession();

	const { data: orders } = useQuery({
		...myOrdersQueryOptions,
		enabled: !!session?.user,
		refetchInterval: 30_000,
	});

	const activeOrders = orders?.filter((o) => ACTIVE_STATUSES.has(o.status));

	if (!activeOrders || activeOrders.length === 0) return null;

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
			<div className="bg-background border border-border rounded-xl shadow-lg overflow-hidden ring-1 ring-black/5">
				<div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-border">
					<Badge
						variant="secondary"
						className="bg-primary/10 text-primary border-none text-xs font-semibold"
					>
						{activeOrders.length}
					</Badge>
					<span className="text-sm font-semibold text-foreground">
						{activeOrders.length === 1 ? "Pedido activo" : "Pedidos activos"}
					</span>
				</div>
				<div className="divide-y divide-border max-h-[200px] overflow-y-auto">
					{activeOrders.slice(0, 3).map((order) => (
						<ActiveOrderItem key={order.id} order={order} />
					))}
					{activeOrders.length > 3 && (
						<Link
							to="/perfil"
							className="block text-center text-xs text-muted-foreground py-2 hover:text-foreground transition-colors"
						>
							Ver todos los pedidos ({activeOrders.length})
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
