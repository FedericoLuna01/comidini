import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { MapPin, Star, Clock, ShoppingBag, Settings, Shield, Mail, Calendar, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/(app)/perfil")({
  component: RouteComponent,
});

function RouteComponent() {
  // Datos de ejemplo basados en tu esquema
  const userData = {
    id: "user_123",
    name: "María González",
    email: "maria.gonzalez@email.com",
    emailVerified: true,
    image: "/placeholder.svg?height=100&width=100",
    role: "user" as const,
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-01-15"),
    banned: false,
    banReason: null,
    banExpires: null,
  };

  const userStats = {
    totalOrders: 47,
    favoriteRestaurants: 12,
    totalSpent: 1250.5,
    averageRating: 4.3,
    memberSince: "Junio 2023",
  };

  const recentOrders = [
    {
      id: "order_001",
      restaurant: "La Parrilla Dorada",
      items: ["Asado completo", "Empanadas x6"],
      total: 45.99,
      date: "2024-01-14",
      status: "delivered",
      rating: 5,
    },
    {
      id: "order_002",
      restaurant: "Pizza Express",
      items: ["Pizza Margherita", "Coca Cola"],
      total: 22.5,
      date: "2024-01-12",
      status: "delivered",
      rating: 4,
    },
    {
      id: "order_003",
      restaurant: "Sushi Zen",
      items: ["Combo Salmón", "Té Verde"],
      total: 38.75,
      date: "2024-01-10",
      status: "delivered",
      rating: 5,
    },
  ];

  const favoriteRestaurants = [
    { name: "La Parrilla Dorada", cuisine: "Parrilla", orders: 8, rating: 4.8 },
    { name: "Pizza Express", cuisine: "Italiana", orders: 6, rating: 4.2 },
    { name: "Sushi Zen", cuisine: "Japonesa", orders: 5, rating: 4.9 },
    { name: "Burger House", cuisine: "Americana", orders: 4, rating: 4.1 },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "premium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header del Perfil */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.image || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback className="text-lg">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  <Badge className={getRoleColor(userData.role)}>
                    {userData.role === "user" ? "Usuario" : userData.role}
                  </Badge>
                  {userData.emailVerified && (
                    <Badge variant="outline" className="text-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  {userData.email}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Miembro desde {userStats.memberSince}
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{userStats.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Órdenes Totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{userStats.favoriteRestaurants}</div>
            <div className="text-sm text-muted-foreground">Restaurantes Favoritos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">${userStats.totalSpent}</div>
            <div className="text-sm text-muted-foreground">Total Gastado</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{userStats.averageRating}</div>
            <div className="text-sm text-muted-foreground">Calificación Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Contenido */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Historial de Órdenes</TabsTrigger>
          <TabsTrigger value="favorites">Restaurantes Favoritos</TabsTrigger>
          <TabsTrigger value="account">Configuración</TabsTrigger>
        </TabsList>

        {/* Historial de Órdenes */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
              <CardDescription>Tus últimas órdenes realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{order.restaurant}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === "delivered" ? "Entregado" : order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{order.items.join(", ")}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {order.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${order.total}</div>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurantes Favoritos */}
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Restaurantes Favoritos</CardTitle>
              <CardDescription>Los lugares donde más has pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {favoriteRestaurants.map((restaurant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">{restaurant.orders} órdenes</span>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{restaurant.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Ver Menú</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Cuenta */}
        <TabsContent value="account">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>Detalles y configuración de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ID de Usuario</label>
                    <p className="text-sm text-muted-foreground">{userData.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rol</label>
                    <p className="text-sm text-muted-foreground capitalize">{userData.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha de Registro</label>
                    <p className="text-sm text-muted-foreground">{userData.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Última Actualización</label>
                    <p className="text-sm text-muted-foreground">{userData.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verificado</h4>
                    <p className="text-sm text-muted-foreground">Tu email ha sido verificado correctamente</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
                <CardDescription>Configura tus preferencias de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificaciones de Órdenes</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones sobre el estado de tus órdenes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Ofertas y Promociones</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe ofertas especiales de tus restaurantes favoritos
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
