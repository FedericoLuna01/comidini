import { getOrderById, updateOrderStatus } from "@repo/db/src/services/orders";
import { getShopById, updateShop } from "@repo/db/src/services/shops";
import crypto from "crypto";
import { type Request, type Response, Router } from "express";
import { MercadoPagoConfig, OAuth, Payment, Preference } from "mercadopago";
import { requireAuth } from "../middlewares/requireAuth";
import { requireShop } from "../middlewares/requireShop";
import { requireShopUser } from "../middlewares/requireShopUser";

const router: Router = Router();

// ============================================================
// OAuth Flow - Vincular cuenta de Mercado Pago
// ============================================================

export const mercadopago = new MercadoPagoConfig({
	accessToken: process.env.MP_ACCESS_TOKEN!,
});
/**
 * GET /api/mercadopago/oauth/authorize
 * Genera la URL de autorización de OAuth de Mercado Pago
 * y redirige al vendedor al flujo de autorización.
 */
router.get(
	"/oauth/authorize",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			const clientId = process.env.MP_CLIENT_ID;

			if (!clientId) {
				res.status(500).json({
					error: "Configuración de Mercado Pago incompleta en el servidor",
				});
				return;
			}

			const redirectUri = `${process.env.MP_URL}/api/mercadopago/connect`;

			const baseUrl = new OAuth(mercadopago).getAuthorizationURL({
				options: {
					client_id: process.env.MP_CLIENT_ID,
					redirect_uri: redirectUri,
				},
			});

			// Agregamos el state con el shopId para recuperarlo en el callback
			const url = `${baseUrl}&state=${req.shop.id}`;

			console.log(url);

			res.json({ authUrl: url });
		} catch (error) {
			console.error("Error generating OAuth URL:", error);
			res
				.status(500)
				.json({ error: "Error al generar la URL de autorización" });
		}
	},
);

/**
 * GET /api/mercadopago/connect
 * Callback de OAuth de Mercado Pago. Recibe el code, lo intercambia
 * por credenciales del vendedor y las guarda en la tienda.
 */
router.get("/connect", async (req: Request, res: Response): Promise<void> => {
	const shopAppUrl =
		process.env.SHOP_BETTER_AUTH_URL || "http://localhost:5175";

	// Helper para redirigir con una página HTML intermedia (evita que dev tunnels reescriba el redirect)
	const safeRedirect = (res: Response, url: string) => {
		res.send(
			`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${url}"><script>window.location.href="${url}";</script></head><body>Redirigiendo...</body></html>`,
		);
	};

	try {
		const code = req.query.code as string;
		const state = req.query.state as string;

		if (!code) {
			safeRedirect(
				res,
				`${shopAppUrl}/dashboard/configuracion?mp_linked=false&error=missing_code`,
			);
			return;
		}

		const shopId = Number(state);
		if (!state || Number.isNaN(shopId)) {
			safeRedirect(
				res,
				`${shopAppUrl}/dashboard/configuracion?mp_linked=false&error=invalid_state`,
			);
			return;
		}

		const shop = await getShopById(shopId);
		if (!shop) {
			res.status(404).json({ error: "Tienda no encontrada" });
			return;
		}

		const clientSecret = process.env.MP_CLIENT_SECRET;
		const redirectUri = `${process.env.MP_URL}/api/mercadopago/connect`;

		if (!clientSecret || !redirectUri) {
			res.status(500).json({
				error: "Configuración de Mercado Pago incompleta",
			});
			return;
		}

		// Intercambiar code por credenciales
		const oauth = new OAuth(mercadopago);

		const oauthResult = await oauth.create({
			body: {
				client_id: process.env.MP_CLIENT_ID,
				client_secret: clientSecret,
				code,
				redirect_uri: redirectUri,
			},
		});

		console.log("OAuth result:", JSON.stringify(oauthResult, null, 2));

		if (!oauthResult.access_token) {
			console.error("OAuth result incomplete:", oauthResult);
			safeRedirect(
				res,
				`${shopAppUrl}/dashboard/configuracion?mp_linked=false&error=oauth_failed`,
			);
			return;
		}

		// Guardar credenciales en la tienda
		await updateShop(shop.id, {
			mpEnabled: true,
			mpUserId: String(oauthResult.user_id),
			mpAccessToken: oauthResult.access_token,
			mpRefreshToken: oauthResult.refresh_token ?? null,
			mpPublicKey: oauthResult.public_key ?? null,
		});

		// Redirigir a la app del shop con estado de éxito
		safeRedirect(res, `${shopAppUrl}/dashboard/configuracion?mp_linked=true`);
	} catch (error) {
		console.error("Error in OAuth connect:", error);
		if (error instanceof Error) {
			console.error("Error message:", error.message);
			console.error("Error stack:", error.stack);
		}
		safeRedirect(
			res,
			`${shopAppUrl}/dashboard/configuracion?mp_linked=false&error=oauth_failed`,
		);
	}
});

/**
 * POST /api/mercadopago/oauth/disconnect
 * Desvincula la cuenta de Mercado Pago de la tienda.
 */
router.post(
	"/oauth/disconnect",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			await updateShop(req.shop.id, {
				mpEnabled: false,
				mpUserId: null,
				mpAccessToken: null,
				mpRefreshToken: null,
				mpPublicKey: null,
			});

			res.json({ message: "Cuenta de Mercado Pago desvinculada exitosamente" });
		} catch (error) {
			console.error("Error disconnecting MP:", error);
			res.status(500).json({ error: "Error al desvincular Mercado Pago" });
		}
	},
);

/**
 * GET /api/mercadopago/status
 * Obtiene el estado de la vinculación de Mercado Pago de la tienda.
 */
router.get(
	"/status",
	requireShopUser,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			res.json({
				linked: req.shop.mpEnabled ?? false,
				userId: req.shop.mpUserId ?? null,
			});
		} catch (error) {
			console.error("Error getting MP status:", error);
			res
				.status(500)
				.json({ error: "Error al obtener estado de Mercado Pago" });
		}
	},
);

// ============================================================
// Checkout Pro - Crear preferencia de pago
// ============================================================

/**
 * POST /api/mercadopago/preference
 * Crea una preferencia de Checkout Pro usando las credenciales
 * del vendedor (modelo Marketplace).
 */
router.post(
	"/preference",
	requireAuth,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { orderId } = req.body;

			if (!orderId) {
				res.status(400).json({ error: "orderId es requerido" });
				return;
			}

			const orderData = await getOrderById(Number(orderId));

			if (!orderData) {
				res.status(404).json({ error: "Orden no encontrada" });
				return;
			}

			// Verificar que el usuario autenticado sea el dueño de la orden
			const userId = req.session?.user?.id;
			if (orderData.order.customerId !== userId) {
				res.status(403).json({ error: "No tienes permiso para esta orden" });
				return;
			}

			const shop = await getShopById(orderData.order.shopId);

			if (!shop) {
				res.status(404).json({ error: "Tienda no encontrada" });
				return;
			}

			if (!shop.mpEnabled || !shop.mpAccessToken) {
				res.status(400).json({
					error: "La tienda no tiene Mercado Pago configurado",
				});
				return;
			}

			// Crear cliente de MP con el access token del vendedor
			const client = new MercadoPagoConfig({
				accessToken: shop.mpAccessToken,
			});

			const preference = new Preference(client);

			const appUrl = process.env.WEB_BETTER_AUTH_URL || "http://localhost:5174";
			const apiUrl = process.env.MP_URL || "http://localhost:3001";

			// Calcular marketplace fee si aplica
			const marketplaceFeePercentage = Number(
				process.env.MP_MARKETPLACE_FEE_PERCENTAGE || "0",
			);
			const total = Number(orderData.order.total);
			const marketplaceFee =
				marketplaceFeePercentage > 0
					? Math.round(total * (marketplaceFeePercentage / 100) * 100) / 100
					: 0;

			const preferenceResult = await preference.create({
				body: {
					items: [
						{
							id: String(orderData.order.id),
							title: `Pedido #${orderData.order.orderNumber}`,
							quantity: 1,
							unit_price: total,
							currency_id: "ARS",
						},
					],
					payer: {
						email: orderData.order.customerEmail || undefined,
					},
					back_urls: {
						success: `${appUrl}/pedido/${orderData.order.id}?status=success`,
						failure: `${appUrl}/pedido/${orderData.order.id}?status=failure`,
						pending: `${appUrl}/pedido/${orderData.order.id}?status=pending`,
					},
					...(appUrl.startsWith("https")
						? { auto_return: "approved" as const }
						: {}),
					external_reference: String(orderData.order.id),
					notification_url: `${apiUrl}/api/mercadopago/webhook`,
					...(marketplaceFee > 0 ? { marketplace_fee: marketplaceFee } : {}),
				},
			});

			// Actualizar la orden a PENDING_PAYMENT
			await updateOrderStatus({
				orderId: orderData.order.id,
				status: "PENDING_PAYMENT",
			});

			res.json({
				preferenceId: preferenceResult.id,
				initPoint: preferenceResult.init_point,
				sandboxInitPoint: preferenceResult.sandbox_init_point,
			});
		} catch (error) {
			console.error("Error creating MP preference:", error);
			res.status(500).json({ error: "Error al crear preferencia de pago" });
		}
	},
);

// ============================================================
// Webhook de Mercado Pago
// ============================================================

/**
 * Verifica la firma HMAC de una notificación webhook de Mercado Pago.
 * Sigue la documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
const verifyWebhookSignature = (
	req: Request,
): { valid: boolean; reason?: string } => {
	const webhookSecret = process.env.MP_WEBHOOK_SECRET;

	// Si no hay secret configurado, no se puede verificar
	if (!webhookSecret) {
		console.warn(
			"MP_WEBHOOK_SECRET no configurado. La verificación de firma está deshabilitada.",
		);
		return { valid: true, reason: "no_secret_configured" };
	}

	const xSignature = req.headers["x-signature"] as string | undefined;
	const xRequestId = req.headers["x-request-id"] as string | undefined;

	if (!xSignature) {
		return { valid: false, reason: "missing_x_signature_header" };
	}

	// Extraer ts y v1 del header x-signature
	const parts = xSignature.split(",");
	let ts: string | undefined;
	let hash: string | undefined;

	for (const part of parts) {
		const [key, value] = part.split("=", 2);
		if (key && value) {
			const trimmedKey = key.trim();
			const trimmedValue = value.trim();
			if (trimmedKey === "ts") ts = trimmedValue;
			else if (trimmedKey === "v1") hash = trimmedValue;
		}
	}

	if (!ts || !hash) {
		return { valid: false, reason: "incomplete_signature" };
	}

	// data.id viene como query param
	const dataId = req.query["data.id"] as string | undefined;

	// Construir el manifest (omitir campos ausentes según la documentación)
	let manifest = "";
	if (dataId) manifest += `id:${dataId};`;
	if (xRequestId) manifest += `request-id:${xRequestId};`;
	manifest += `ts:${ts};`;

	// Calcular HMAC SHA256
	const computedHash = crypto
		.createHmac("sha256", webhookSecret)
		.update(manifest)
		.digest("hex");

	if (computedHash !== hash) {
		return { valid: false, reason: "signature_mismatch" };
	}

	return { valid: true };
};

/**
 * POST /api/mercadopago/webhook
 * Recibe notificaciones de pago de Mercado Pago.
 * Verifica la firma HMAC antes de procesar.
 */
router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
	try {
		// Verificar firma del webhook
		const signatureCheck = verifyWebhookSignature(req);
		if (!signatureCheck.valid) {
			console.error(
				`Webhook signature verification failed: ${signatureCheck.reason}`,
			);
			res.status(401).json({ error: "Firma de webhook inválida" });
			return;
		}

		const body = req.body;

		// Manejar formatos IPN y webhook
		if (
			body.type !== "payment" &&
			body.action !== "payment.created" &&
			body.action !== "payment.updated"
		) {
			res.json({ received: true });
			return;
		}

		const paymentId = body.data?.id;
		if (!paymentId) {
			res.json({ received: true });
			return;
		}

		// Para obtener la info del pago necesitamos el access token del vendedor.
		// Lo obtenemos a través del external_reference (orderId).
		// Primero intentamos con el access token de la plataforma para obtener info básica.

		const platformToken = process.env.MP_ACCESS_TOKEN;
		if (!platformToken) {
			console.error("MP_ACCESS_TOKEN not configured");
			res.json({ received: true });
			return;
		}

		const client = new MercadoPagoConfig({
			accessToken: platformToken,
		});

		const payment = new Payment(client);
		const paymentData = await payment.get({ id: String(paymentId) });

		if (!paymentData?.external_reference) {
			res.json({ received: true });
			return;
		}

		const orderId = Number(paymentData.external_reference);
		if (Number.isNaN(orderId)) {
			res.json({ received: true });
			return;
		}

		// Verificar que la orden exista
		const orderData = await getOrderById(orderId);
		if (!orderData) {
			console.error(`Order ${orderId} not found for payment ${paymentId}`);
			res.json({ received: true });
			return;
		}

		// Idempotencia: no actualizar si ya está en un estado terminal
		if (
			orderData.order.status === "PAID" ||
			orderData.order.status === "SCANNED" ||
			orderData.order.status === "CANCELLED"
		) {
			res.json({ received: true });
			return;
		}

		// Actualizar estado según el pago
		if (paymentData.status === "approved") {
			await updateOrderStatus({
				orderId,
				status: "PAID",
				notes: `Pago aprobado vía Mercado Pago. Payment ID: ${paymentId}`,
			});
		} else if (
			paymentData.status === "rejected" ||
			paymentData.status === "cancelled" ||
			paymentData.status === "refunded"
		) {
			await updateOrderStatus({
				orderId,
				status: "CANCELLED",
				notes: `Pago ${paymentData.status} vía Mercado Pago. Payment ID: ${paymentId}`,
			});
		}

		// Siempre responder 200 para evitar reintentos infinitos
		res.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		// Siempre responder 200 para evitar reintentos infinitos
		res.json({ received: true });
	}
});

// GET para verificación de Mercado Pago
router.get("/webhook", async (_req: Request, res: Response): Promise<void> => {
	res.json({ status: "ok" });
});

export default router;
