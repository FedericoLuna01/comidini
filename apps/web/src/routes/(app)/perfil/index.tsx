import { authClient } from "@repo/auth/client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInMonths, differenceInYears } from "date-fns";
import {
	Calendar,
	Clock,
	DollarSign,
	Loader2,
	Mail,
	Package,
	Settings,
	Shield,
	ShoppingBag,
} from "lucide-react";
import { myOrdersQueryOptions, type Order } from "../../../api/orders";

export const Route = createFileRoute("/(app)/perfil/")({
	component: RouteComponent,
});

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
	CREATED: { label: "Creado", className: "bg-gray-100 text-gray-800" },
	PENDING_PAYMENT: {
		label: "Pago pendiente",
		className: "bg-yellow-100 text-yellow-800",
	},
	PAID: { label: "Pagado", className: "bg-blue-100 text-blue-800" },
	PREPARING: {
		label: "Preparando",
		className: "bg-orange-100 text-orange-800",
	},
	READY: { label: "Listo", className: "bg-teal-100 text-teal-800" },
	SCANNED: { label: "Entregado", className: "bg-green-100 text-green-800" },
	CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800" },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
	cash: "Efectivo",
	card: "Tarjeta",
	transfer: "Transferencia",
	mercadopago: "Mercado Pago",
};

const ORDER_TYPE_LABEL: Record<string, string> = {
	delivery: "Delivery",
	pickup: "Retiro",
	dine_in: "En local",
};

function RouteComponent() {
	const { data: session } = authClient.useSession();
	const { data: orders, isPending: ordersPending } =
		useQuery(myOrdersQueryOptions);

	console.log(orders);

	const totalSpent =
		orders?.reduce((sum, o) => sum + Number.parseFloat(o.total), 0) ?? 0;

	const uniqueShops = new Set(orders?.map((o) => o.shopId) ?? []).size;

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Header del Perfil */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<Avatar className="h-20 w-20">
								<AvatarImage
									src={session?.user.image || "/placeholder.svg"}
									alt={session?.user.name}
								/>
								<AvatarFallback className="text-lg">
									{session?.user.name
										?.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<h1 className="text-2xl font-bold">{session?.user.name}</h1>
									{session?.user.emailVerified && (
										<Badge variant="outline" className="text-green-600">
											<Shield className="w-3 h-3 mr-1" />
											Verificado
										</Badge>
									)}
								</div>
								<div className="flex items-center text-muted-foreground">
									<Mail className="w-4 h-4 mr-2" />
									{session?.user.email}
								</div>
								<div className="flex items-center text-muted-foreground">
									<Calendar className="w-4 h-4 mr-2" />
									Miembro hace{" "}
									{differenceInYears(
										new Date(),
										new Date(session?.user.createdAt || new Date()),
									) >= 1
										? `${differenceInYears(new Date(), new Date(session?.user.createdAt || new Date()))} años`
										: `${differenceInMonths(new Date(), new Date(session?.user.createdAt || new Date()))} meses`}
								</div>
							</div>
						</div>
						<Button variant="outline" asChild>
							<Link to="/perfil/editar">
								<Settings className="w-4 h-4 mr-2" />
								Editar Perfil
							</Link>
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Estadísticas */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardContent className="p-4 text-center">
						<ShoppingBag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
						<div className="text-2xl font-bold">{orders?.length ?? 0}</div>
						<div className="text-sm text-muted-foreground">Pedidos</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
						<div className="text-2xl font-bold">{uniqueShops}</div>
						<div className="text-sm text-muted-foreground">Tiendas</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
						<div className="text-2xl font-bold">
							$
							{totalSpent.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
						</div>
						<div className="text-sm text-muted-foreground">Total Gastado</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs de Contenido */}
			<Tabs defaultValue="orders" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="orders">Historial de Pedidos</TabsTrigger>
					<TabsTrigger value="account">Configuración</TabsTrigger>
				</TabsList>

				{/* Historial de Órdenes */}
				<TabsContent value="orders">
					<Card>
						<CardHeader>
							<CardTitle>Pedidos Recientes</CardTitle>
							<CardDescription>Tu historial de pedidos</CardDescription>
						</CardHeader>
						<CardContent>
							{ordersPending ? (
								<div className="flex justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : !orders || orders.length === 0 ? (
								<div className="text-center py-8">
									<ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
									<p className="text-muted-foreground">
										Todavía no realizaste ningún pedido
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{orders.map((order) => (
										<OrderRow key={order.id} order={order} />
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Configuración de Cuenta */}
				<TabsContent value="account">
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Información de la Cuenta</CardTitle>
								<CardDescription>
									Detalles y configuración de tu cuenta
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium">Nombre</p>
										<p className="text-sm text-muted-foreground">
											{session?.user.name}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium">Email</p>
										<p className="text-sm text-muted-foreground">
											{session?.user.email}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium">Rol</p>
										<p className="text-sm text-muted-foreground capitalize">
											{session?.user.role}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium">Fecha de Registro</p>
										<p className="text-sm text-muted-foreground">
											{session?.user.createdAt
												? new Date(session.user.createdAt).toLocaleDateString(
														"es-AR",
													)
												: "-"}
										</p>
									</div>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Email Verificado</h4>
										<p className="text-sm text-muted-foreground">
											{session?.user.emailVerified
												? "Tu email ha sido verificado correctamente"
												: "Tu email no ha sido verificado"}
										</p>
									</div>
									{session?.user.emailVerified && (
										<Badge variant="outline" className="text-green-600">
											<Shield className="w-3 h-3 mr-1" />
											Verificado
										</Badge>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function OrderRow({ order }: { order: Order }) {
	const statusConfig = STATUS_CONFIG[order.status] ?? {
		label: order.status,
		className: "bg-gray-100 text-gray-800",
	};

	return (
		<Link
			to="/pedido/$orderId"
			params={{ orderId: String(order.id) }}
			className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1 flex-wrap">
					<h3 className="font-semibold truncate">
						{order.shopName ?? `Tienda #${order.shopId}`}
					</h3>
					<Badge className={statusConfig.className}>{statusConfig.label}</Badge>
					<Badge variant="outline" className="text-xs">
						{ORDER_TYPE_LABEL[order.type] ?? order.type}
					</Badge>
				</div>
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<span className="flex items-center">
						<Clock className="w-3 h-3 mr-1" />
						{new Date(order.createdAt).toLocaleDateString("es-AR", {
							day: "numeric",
							month: "short",
							year: "numeric",
						})}
					</span>
					<span>#{order.orderNumber}</span>
					<span>
						{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
					</span>
				</div>
			</div>
			<div className="text-right ml-4 shrink-0">
				<div className="font-semibold">
					$
					{Number.parseFloat(order.total).toLocaleString("es-AR", {
						minimumFractionDigits: 2,
					})}
				</div>
			</div>
		</Link>
	);
}
