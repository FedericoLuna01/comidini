# API de Onboarding para Tiendas

Este módulo implementa el sistema de onboarding para usuarios de tipo "shop" que han sido creados por el administrador.

## Endpoints

### 1. Verificar Estado del Onboarding

```
GET /api/shops/onboarding/status
```

**Headers requeridos:**

- Authorization: Bearer {token}

**Respuesta:**

```json
{
  "userId": "user_id",
  "hasShop": false,
  "onboardingCompleted": false
}
```

### 2. Completar Onboarding

```
POST /api/shops/onboarding/complete
```

**Headers requeridos:**

- Authorization: Bearer {token}
- Content-Type: application/json

**Body:**

```json
{
  "name": "Nombre de la Tienda",
  "description": "Descripción opcional",
  "phone": "1234567890",
  "email": "tienda@ejemplo.com",
  "website": "https://tienda.com",
  "address": "Dirección completa",
  "city": "Ciudad",
  "state": "Estado",
  "country": "País",
  "postalCode": "12345",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "deliveryRadius": 5000,
  "minimumOrder": 100.0,
  "deliveryFee": 50.0,
  "acceptsDelivery": true,
  "acceptsPickup": true,
  "acceptsReservations": false,
  "businessHours": [
    {
      "dayOfWeek": 1,
      "openTime": "09:00",
      "closeTime": "18:00",
      "isClosed": false
    }
  ],
  "categoryIds": ["category_id_1", "category_id_2"]
}
```

**Respuesta:**

```json
{
  "shopId": "shop_id",
  "message": "Onboarding completado exitosamente"
}
```

### 3. Obtener Categorías Disponibles

```
GET /api/shops/categories
```

**Respuesta:**

```json
[
  {
    "id": "category_id",
    "name": "Restaurante",
    "description": "Restaurantes y comida",
    "icon": "restaurant"
  }
]
```

### 4. Obtener Perfil de Tienda

```
GET /api/shops/profile
```

**Headers requeridos:**

- Authorization: Bearer {token}

**Respuesta:**

```json
{
  "id": "shop_id",
  "userId": "user_id",
  "name": "Nombre de la Tienda",
  "description": "Descripción",
  "phone": "1234567890",
  "email": "tienda@ejemplo.com",
  "website": "https://tienda.com",
  "address": "Dirección",
  "city": "Ciudad",
  "state": "Estado",
  "country": "País",
  "postalCode": "12345",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "status": "pending",
  "deliveryRadius": 5000,
  "minimumOrder": 100.0,
  "deliveryFee": 50.0,
  "acceptsDelivery": true,
  "acceptsPickup": true,
  "acceptsReservations": false,
  "onboardingCompleted": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Flujo de Onboarding

1. **Creación de Usuario**: El administrador crea un usuario de tipo "shop"
2. **Primer Login**: El usuario se loguea en la app de shop
3. **Verificación**: La app verifica el estado del onboarding con `/api/shops/onboarding/status`
4. **Onboarding**: Si `onboardingCompleted` es `false`, se muestra el formulario de onboarding
5. **Completar**: El usuario completa el formulario y se envía a `/api/shops/onboarding/complete`
6. **Confirmación**: El sistema marca `onboardingCompleted` como `true`

## Validaciones

- Solo usuarios de tipo "shop" pueden acceder a los endpoints de onboarding
- Un usuario solo puede tener una tienda asociada
- Los campos requeridos son: `name`, `address`, `city`, `state`, `country`
- Los horarios de negocio son opcionales pero deben seguir el formato HH:MM
- Las coordenadas (latitude/longitude) son opcionales pero deben estar en rangos válidos

## Códigos de Error

- `401`: No autorizado (token inválido o faltante)
- `403`: Acceso denegado (usuario no es de tipo shop)
- `400`: Datos inválidos (errores de validación)
- `404`: Tienda no encontrada
- `500`: Error interno del servidor
