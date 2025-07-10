import { Router, Request, Response, NextFunction } from "express";
import { createShop, getShopByUserId } from "@repo/db/src/services/shops";
import { requireShopUser } from "../middlewares/requireShopUser";
import { createShopSchema } from "@repo/db/src/types/shop";

const router: Router = Router();

router.get("/status", requireShopUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const session = req.session;

    if (!session || !session.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const shop = await getShopByUserId(session.user.id);

    res.json(shop);
  } catch (error) {
    console.error("Error in /status route:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/create", requireShopUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const session = req.session;

    if (!session || !session.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    // TODO: Ver que el usuario no tenga una tienda creada

    const userId = session.user.id;
    const shopData = req.body;

    // Validar los datos de la tienda usando el esquema de base de datos
    const validatedFields = createShopSchema.safeParse({ ...shopData, userId });

    if (!validatedFields.success) {
      console.error("Validation errors:", validatedFields.error);
      res.status(400).json({ error: "Datos de tienda inválidos", details: validatedFields.error });
      return;
    }

    await createShop({
      ...validatedFields.data,
      userId,
    });

    res.status(201).json({ message: "Tienda creada exitosamente" });
  } catch (error) {
    console.error("Error al crear tienda:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

export default router;
