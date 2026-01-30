import {
	addItemToCart,
	clearAllCarts,
	getAllCartsWithItems,
	getCartWithItems,
	getOrCreateCart,
	mergeGuestCart,
	removeCartItem,
	updateCartItem,
} from "@repo/db/src/services/cart";
import { getShopById } from "@repo/db/src/services/shops";
import { addToCartSchema, updateCartItemSchema } from "@repo/db/src/types/cart";
import { Router } from "express";

const router: Router = Router();

/**
 * GET /api/cart
 * Obtiene el carrito actual del usuario o sesión guest
 */
router.get("/", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const cartData = await getCartWithItems({ userId, sessionId });

		if (!cartData) {
			res.status(200).json({ cart: null, items: [] });
			return;
		}

		res.status(200).json(cartData);
	} catch (error) {
		console.error("Error al obtener carrito:", error);
		res.status(500).json({ error: "Error al obtener el carrito" });
	}
});

/**
 * GET /api/cart/all
 * Obtiene todos los carritos del usuario agrupados por tienda
 */
router.get("/all", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const carts = await getAllCartsWithItems({ userId, sessionId });

		// Agregar información de la tienda a cada carrito
		const cartsWithShopInfo = await Promise.all(
			carts.map(async (cartData) => {
				const shop = await getShopById(cartData.cart.shopId);
				return {
					...cartData,
					shop: shop
						? {
								id: shop.id,
								name: shop.name,
								logo: shop.logo,
							}
						: null,
				};
			}),
		);

		res.status(200).json(cartsWithShopInfo);
	} catch (error) {
		console.error("Error al obtener carritos:", error);
		res.status(500).json({ error: "Error al obtener los carritos" });
	}
});

/**
 * POST /api/cart/items
 * Agrega un item al carrito
 */
router.post("/items", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const body = req.body;
		const validatedFields = addToCartSchema.safeParse(body);

		if (!validatedFields.success) {
			console.error("Errores de validación:", validatedFields.error);
			res.status(400).json({
				error: "Datos inválidos",
				details: validatedFields.error,
			});
			return;
		}

		const { shopId } = req.body;

		if (!shopId) {
			res.status(400).json({ error: "shopId es requerido" });
			return;
		}

		// Obtener o crear carrito
		const cart = await getOrCreateCart({
			userId,
			sessionId,
			shopId: Number(shopId),
		});

		if (!cart) {
			res.status(500).json({ error: "No se pudo obtener o crear el carrito" });
			return;
		}

		// Agregar item al carrito
		const itemId = await addItemToCart(cart.id, validatedFields.data);

		res.status(201).json({
			success: true,
			itemId,
			message: "Producto agregado al carrito",
		});
	} catch (error) {
		console.error("Error al agregar al carrito:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Error al agregar al carrito";
		res.status(500).json({ error: errorMessage });
	}
});

/**
 * PUT /api/cart/items/:itemId
 * Actualiza un item del carrito (cantidad o notas)
 */
router.put("/items/:itemId", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const itemId = Number(req.params.itemId);
		const body = req.body;

		const validatedFields = updateCartItemSchema.safeParse(body);

		if (!validatedFields.success) {
			console.error("Errores de validación:", validatedFields.error);
			res.status(400).json({
				error: "Datos inválidos",
				details: validatedFields.error,
			});
			return;
		}

		const updatedItem = await updateCartItem(itemId, validatedFields.data);

		if (!updatedItem) {
			res.status(404).json({ error: "Item no encontrado" });
			return;
		}

		res.status(200).json({
			success: true,
			item: updatedItem,
			message: "Item actualizado",
		});
	} catch (error) {
		console.error("Error al actualizar item:", error);
		res.status(500).json({ error: "Error al actualizar el item" });
	}
});

/**
 * DELETE /api/cart/items/:itemId
 * Elimina un item del carrito
 */
router.delete("/items/:itemId", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const itemId = Number(req.params.itemId);

		await removeCartItem(itemId);

		res.status(200).json({
			success: true,
			message: "Item eliminado del carrito",
		});
	} catch (error) {
		console.error("Error al eliminar item:", error);
		res.status(500).json({ error: "Error al eliminar el item" });
	}
});

/**
 * DELETE /api/cart
 * Limpia todos los items de todos los carritos del usuario
 */
router.delete("/", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.headers["x-session-id"] as string;

		if (!userId && !sessionId) {
			res.status(400).json({
				error: "Se requiere autenticación o session ID",
			});
			return;
		}

		const clearedCount = await clearAllCarts({ userId, sessionId });

		res.status(200).json({
			success: true,
			clearedCarts: clearedCount,
			message: "Carritos vaciados",
		});
	} catch (error) {
		console.error("Error al limpiar carritos:", error);
		res.status(500).json({ error: "Error al limpiar los carritos" });
	}
});

/**
 * POST /api/cart/merge
 * Fusiona el carrito guest con el carrito del usuario autenticado
 */
router.post("/merge", async (req, res) => {
	try {
		const userId = req.session?.user?.id;
		const sessionId = req.body.sessionId as string;

		if (!userId) {
			res.status(401).json({
				error: "Se requiere autenticación",
			});
			return;
		}

		if (!sessionId) {
			res.status(400).json({
				error: "sessionId es requerido",
			});
			return;
		}

		const mergedCart = await mergeGuestCart(sessionId, userId);

		res.status(200).json({
			success: true,
			cart: mergedCart,
			message: "Carritos fusionados exitosamente",
		});
	} catch (error) {
		console.error("Error al fusionar carritos:", error);
		res.status(500).json({ error: "Error al fusionar los carritos" });
	}
});

export default router;
