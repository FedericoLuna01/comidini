import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createShop, getShopByUserId } from "@repo/db/src/services/shops";
import { requireShopUser } from "../middlewares/requireShopUser";
import { shopOnboardingSchema } from "@repo/db/src/types/shop";

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

    // Validar los datos de la tienda
    const validatedFields = shopOnboardingSchema.parse(shopData);

    if (!validatedFields) {
      res.status(400).json({ error: "Datos de tienda inválidos" });
      return;
    }

    await createShop(userId, shopData);

    res.status(201).json({ message: "Tienda creada exitosamente" });
  } catch (error) {
    console.error("Error al crear tienda:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

// // GET /api/shops/onboarding/status - Verificar estado del onboarding
// router.get("/onboarding/status", requireAuth, requireShopUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user!.id;
//     const status = await getOnboardingStatus(userId);
//     res.json(status);
//   } catch (error) {
//     console.error("Error al obtener estado del onboarding:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// // POST /api/shops/onboarding/complete - Completar onboarding
// router.post("/onboarding/complete", requireAuth, requireShopUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user!.id;
//     const data = req.body;

//     // Validar los datos con Zod
//     const validatedData = shopOnboardingSchema.parse(data);

//     const result = await completeOnboarding(userId, validatedData);
//     res.json(result);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({
//         error: "Datos inválidos",
//         details: error.errors
//       });
//       return;
//     }

//     if (error instanceof Error) {
//       res.status(400).json({ error: error.message });
//       return;
//     }

//     console.error("Error al completar onboarding:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// // GET /api/shops/categories - Obtener categorías disponibles
// router.get("/categories", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const categories = await getCategories();
//     res.json(categories);
//   } catch (error) {
//     console.error("Error al obtener categorías:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// // GET /api/shops/profile - Obtener perfil de la tienda del usuario
// router.get("/profile", requireAuth, requireShopUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.user!.id;
//     const shopData = await getShopByUserId(userId);

//     if (!shopData) {
//       res.status(404).json({ error: "Tienda no encontrada" });
//       return;
//     }

//     res.json(shopData);
//   } catch (error) {
//     console.error("Error al obtener perfil de tienda:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// Ruta de prueba
router.get("/", (req: Request, res: Response): void => {
  res.send("Welcome to the Shop API!");
});

export default router;
