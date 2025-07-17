import { getShopByUserId } from "@repo/db/src/services/shops";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware para verificar que el usuario tenga una tienda asociada.
**/
export const requireShop = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session?.user;

  if (!user) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const shop = await getShopByUserId(user?.id);

  if (!shop) {
    res.status(404).json({ error: "Tienda no encontrada" });
    return;
  }

  req.shop = shop; // Almacenar la tienda en el objeto req

  next();
};
