import { auth } from "@repo/auth";
import { fromNodeHeaders } from "@repo/auth/server";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware para verificar que el usuario está autenticado.
**/
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  req.session = session; // Almacenar la sesión en el objeto req

  next();
};
