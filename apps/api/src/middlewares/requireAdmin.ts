import type { NextFunction, Request, Response } from "express";

/**
 * Middleware para verificar que el usuario tenga rol de admin.
 **/
export const requireAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = req.session?.user;

	if (!user) {
		res.status(401).json({ error: "No autorizado" });
		return;
	}

	if (user.role !== "admin") {
		res
			.status(403)
			.json({ error: "Acceso denegado. Se requiere rol de admin" });
		return;
	}

	next();
};
