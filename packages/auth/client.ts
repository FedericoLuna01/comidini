import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./src/auth";
import { ac, admin, shop, user } from "./src/permissions";

export type { UserWithRole } from "better-auth/plugins";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	// baseURL: "http://localhost:3001",
	baseURL: "https://api.antojados.app",
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
