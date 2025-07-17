import { Router, Request, Response } from "express";
import { createManyShopHours, createShop, getShopByUserId, getShopHoursByShopId, updateShopHours } from "@repo/db/src/services/shops";
import { requireShopUser } from "../middlewares/requireShopUser";
import { CreateShopHours, createShopHoursSchema, createShopSchema } from "@repo/db/src/types/shop";
import { requireShop } from "../middlewares/requireShop";
import { z } from "zod/v4";

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

    const shop = await getShopByUserId(session.user.id);

    if (shop) {
      res.status(400).json({ error: "Ya tienes una tienda creada" });
      return;
    }

    const userId = session.user.id;
    const shopData = req.body;

    const businessHours: CreateShopHours[] = shopData.businessHours || [];

    // Validar los datos de la tienda usando el esquema de base de datos
    const validatedFields = createShopSchema.safeParse({ ...shopData, userId });

    if (!validatedFields.success) {
      console.error("Validation errors:", validatedFields.error);
      res.status(400).json({ error: "Datos de tienda inválidos", details: validatedFields.error });
      return;
    }

    const createdShop = await createShop({
      ...validatedFields.data,
      userId,
    });

    if (!createdShop) {
      res.status(500).json({ error: "Error al crear la tienda" });
      return;
    }

    const shopHoursValues = businessHours.map((hours) => ({
      shopId: createdShop.id,
      ...hours
    }));

    if (shopHoursValues.length > 0) {
      await createManyShopHours(shopHoursValues);
    }

    res.status(201).json({ message: "Tienda creada exitosamente" });
  } catch (error) {
    console.error("Error al crear tienda:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

router.get("/hours", requireShopUser, requireShop, async (req: Request, res: Response): Promise<void> => {
  try {

    if (!req.shop) {
      res.status(404).json({ error: "Tienda no encontrada" });
      return;
    }

    const hours = await getShopHoursByShopId(req.shop.id);

    if (!hours || hours.length === 0) {
      res.status(404).json({ error: "No se encontraron horarios para esta tienda" });
      return;
    }

    res.json(hours);
  } catch (error) {
    console.error("Error in /hours route:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

router.put("/hours", requireShopUser, requireShop, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.shop) {
      res.status(404).json({ error: "Tienda no encontrada" });
      return;
    }

    const newHoursData = req.body;

    const validatedFields = z.array(createShopHoursSchema).safeParse(newHoursData);

    if (!validatedFields.success) {
      console.error("Validation errors:", validatedFields.error);
      res.status(400).json({ error: "Datos de horarios inválidos", details: validatedFields.error });
      return;
    }

    if (!Array.isArray(validatedFields.data) || validatedFields.data.length === 0) {
      res.status(400).json({ error: "Datos de horarios inválidos" });
      return;
    }

    const updatedHours = await updateShopHours(req.shop.id, validatedFields.data);

    res.json(updatedHours);
  } catch (error) {
    console.error("Error updating shop hours:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
