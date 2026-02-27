import { auth } from "@repo/auth";
import { fromNodeHeaders } from "@repo/auth/server";
import { getAllCartsWithItems } from "@repo/db/src/services/cart";
import {
	createOrderFromCart,
	getOrderById,
	getOrdersByCustomerId,
	getOrdersByShopId,
	updateOrderStatus,
} from "@repo/db/src/services/orders";
import { updateOrderStatusSchema } from "@repo/db/src/types/shop";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router: Router = Router();

/**
 * GET /api/orders/shop/:shopId
 * Obtiene todas las órdenes de una tienda
 */
router.get("/shop/:shopId", async (req, res) => {
	try {
		const { shopId } = req.params;

		if (!shopId) {
			res.status(400).json({ error: "shopId es requerido" });
			return;
		}

		const orders = await getOrdersByShopId(Number(shopId));

		res.status(200).json(orders);
	} catch (error) {
		console.error("Error al obtener órdenes:", error);
		res.status(500).json({ error: "Error al obtener las órdenes" });
	}
});

/**
 * GET /api/orders/my-orders
 * Obtiene las órdenes del usuario autenticado
 */
router.get("/my-orders", requireAuth, async (req, res) => {
	try {
		const userId = req.session?.user?.id;

		if (!userId) {
			res.status(401).json({ error: "No autenticado" });
			return;
		}

		const orders = await getOrdersByCustomerId(userId);

		res.status(200).json(orders);
	} catch (error) {
		console.error("Error al obtener órdenes del usuario:", error);
		res.status(500).json({ error: "Error al obtener las órdenes" });
	}
});

/**
 * GET /api/orders/:orderId
 * Obtiene una orden específica con sus items
 */
router.get("/:orderId", async (req, res) => {
	try {
		const { orderId } = req.params;

		if (!orderId) {
			res.status(400).json({ error: "orderId es requerido" });
			return;
		}

		const order = await getOrderById(Number(orderId));

		if (!order) {
			res.status(404).json({ error: "Orden no encontrada" });
			return;
		}

		res.status(200).json(order);
	} catch (error) {
		console.error("Error al obtener orden:", error);
		res.status(500).json({ error: "Error al obtener la orden" });
	}
});

/**
 * GET /api/orders/customer/:customerId
 * Obtiene las órdenes de un cliente
 */
router.get("/customer/:customerId", async (req, res) => {
	try {
		const { customerId } = req.params;

		if (!customerId) {
			res.status(400).json({ error: "customerId es requerido" });
			return;
		}

		const orders = await getOrdersByCustomerId(customerId);

		res.status(200).json(orders);
	} catch (error) {
		console.error("Error al obtener órdenes del cliente:", error);
		res.status(500).json({ error: "Error al obtener las órdenes" });
	}
});

/**
 * POST /api/orders
 * Crea una nueva orden a partir del carrito
 */
router.post("/", async (req, res) => {
	try {
		// Resolve session to get userId (session is not set without requireAuth middleware)
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		const userId = session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const body = req.body;

		// Validar campos requeridos básicos
		const { shopId, customerName, customerPhone, type, paymentMethod } = body;

		if (!shopId || !customerName || !customerPhone || !type || !paymentMethod) {
			res.status(400).json({
				error: "Faltan campos requeridos",
				required: [
					"shopId",
					"customerName",
					"customerPhone",
					"type",
					"paymentMethod",
				],
			});
			return;
		}

		// Obtener todos los carritos del usuario
		const allCarts = await getAllCartsWithItems({ userId, sessionId });

		// Encontrar el carrito de la tienda específica
		const cartData = allCarts.find((c) => c.cart?.shopId === Number(shopId));

		if (!cartData || !cartData.cart) {
			res
				.status(400)
				.json({ error: "No se encontró un carrito activo para esta tienda" });
			return;
		}

		if (cartData.items.length === 0) {
			res.status(400).json({
				error: "No hay productos de esta tienda en el carrito",
			});
			return;
		}

		// Crear la orden
		const order = await createOrderFromCart({
			cartId: cartData.cart.id,
			shopId: Number(shopId),
			customerId: userId,
			customerName: body.customerName,
			customerEmail: body.customerEmail,
			customerPhone: body.customerPhone,
			type: body.type,
			paymentMethod: body.paymentMethod,
			deliveryAddress: body.deliveryAddress,
			deliveryInstructions: body.deliveryInstructions,
			notes: body.notes,
		});

		res.status(201).json({
			success: true,
			order,
			message: "Orden creada exitosamente",
		});
	} catch (error) {
		console.error("Error al crear orden:", error);
		res.status(500).json({
			error: error instanceof Error ? error.message : "Error al crear la orden",
		});
	}
});

/**
 * PUT /api/orders/:orderId/status
 * Actualiza el estado de una orden
 */
router.put("/:orderId/status", async (req, res) => {
	try {
		const { orderId } = req.params;
		const userId = req.session?.user?.id;

		if (!orderId) {
			res.status(400).json({ error: "orderId es requerido" });
			return;
		}

		const body = req.body;
		const validatedFields = updateOrderStatusSchema.safeParse(body);

		if (!validatedFields.success) {
			console.error("Errores de validación:", validatedFields.error);
			res.status(400).json({
				error: "Datos inválidos",
				details: validatedFields.error,
			});
			return;
		}

		const updatedOrder = await updateOrderStatus({
			orderId: Number(orderId),
			status: validatedFields.data.status,
			notes: validatedFields.data.notes,
			updatedBy: userId,
		});

		res.status(200).json({
			success: true,
			order: updatedOrder,
			message: "Estado actualizado exitosamente",
		});
	} catch (error) {
		console.error("Error al actualizar estado:", error);
		res.status(500).json({ error: "Error al actualizar el estado" });
	}
});

export default router;
