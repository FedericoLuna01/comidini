import { auth } from "@repo/auth";
import { fromNodeHeaders } from "@repo/auth/server";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware para verificar que el usuario es un usuario de tienda
 * y que está autenticado.
**/
export const requireShopUser = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  if (!session || session.user.role !== 'shop') {
    res.status(403).json({ error: "Acceso denegado. Solo usuarios de tienda pueden acceder." });
    return;
  }

  req.session = session; // Almacenar la sesión en el objeto req

  next();
};
