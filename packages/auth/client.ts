import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./src/auth";
import { ac, admin, shop, user } from "./src/permissions";

export type { UserWithRole } from "better-auth/plugins";

// Intentar obtener la URL de la API desde variables de entorno
const getBaseURL = () => {
	// Vite (apps/admin, apps/web)
	// @ts-ignore
	if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
		// @ts-ignore
		return import.meta.env.VITE_API_URL;
	}
	// Node (apps/api)
	return (
		process.env.VITE_API_URL || process.env.API_URL || "http://localhost:3001"
	);
};

const apiBaseUrl = getBaseURL();
// Asegurar que la URL de auth termine en /api/auth
const authBaseUrl = apiBaseUrl.endsWith("/api/auth")
	? apiBaseUrl
	: `${apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl}/auth`;

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: authBaseUrl,
	plugins: [
		adminClient({
			ac,
			roles: {
				admin,
				user,
				shop,
			},
		}),
		inferAdditionalFields<typeof auth>(),
	],
});

export type Session = typeof authClient.$Infer.Session;
