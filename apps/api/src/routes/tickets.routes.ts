import { createTicket, getAllTickets } from "@repo/db/src/services/tickets";
import { createTicketSchema } from "@repo/db/src/types/ticket";
import { type Request, type Response, Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { requireAuth } from "../middlewares/requireAuth";
import { requireShop } from "../middlewares/requireShop";

const router: Router = Router();

// POST /api/tickets - Crear un nuevo ticket (requiere autenticación y tener una tienda)
router.post(
	"/",
	requireAuth,
	requireShop,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const validatedData = createTicketSchema.parse(req.body);
			const shop = req.shop;

			if (!shop) {
				res.status(400).json({ error: "No se encontró la tienda" });
				return;
			}

			const ticket = await createTicket({
				...validatedData,
				shopId: shop.id,
			});

			res.status(201).json(ticket);
		} catch (error) {
			console.error("Error creating ticket:", error);
			if (error instanceof Error && "issues" in error) {
				res.status(400).json({ error: "Datos inválidos", details: error });
				return;
			}
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

// GET /api/tickets - Obtener todos los tickets (requiere autenticación y rol de admin)
router.get(
	"/",
	requireAuth,
	requireAdmin,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const page = Number(req.query.page) || 1;
			const limit = Math.min(Number(req.query.limit) || 10, 100); // Máximo 100

			const result = await getAllTickets({ page, limit });
			res.json(result);
		} catch (error) {
			console.error("Error fetching tickets:", error);
			res.status(500).json({ error: "Error interno del servidor" });
		}
	},
);

export default router;
