import { db } from "@repo/db/src";
import { schema } from "@repo/db/src/schema";
import { sendResetPassword } from "@repo/email/send/send-reset-password";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import dotenv from "dotenv";
import { ac, admin, shop, user } from "./permissions";

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../../../.env" });
dotenv.config({ path: "../../../../.env" });

// Obtener URLs con fallbacks
const ADMIN_URL = process.env.ADMIN_BETTER_AUTH_URL || process.env.ADMIN_URL;
const WEB_URL = process.env.WEB_BETTER_AUTH_URL || process.env.WEB_URL;
const SHOP_URL = process.env.SHOP_BETTER_AUTH_URL || process.env.SHOP_URL;

// Validar que las variables de entorno requeridas estén definidas
if (!process.env.BETTER_AUTH_SECRET) {
	throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!ADMIN_URL || !WEB_URL || !SHOP_URL) {
	console.warn(
		"Warning: Some frontend URLs are not defined in environment variables",
	);
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	onAPIError: {
		errorURL: `${WEB_URL || ""}/iniciar-sesion`,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }) => {
			await sendResetPassword({ email: user.email, url, firstName: user.name });
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
				shop,
			},
			bannedUserMessage:
				"Tu cuenta ha sido suspendida. Si crees que esto es un error, contacta al administrador.",
		}),
	],
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins: [
		// Agregar URLs con y sin barra final para compatibilidad
		...[
			ADMIN_URL,
			WEB_URL,
			SHOP_URL,
			process.env.ADMIN_BETTER_AUTH_URL,
			process.env.WEB_BETTER_AUTH_URL,
			process.env.SHOP_BETTER_AUTH_URL,
		].flatMap((url) => {
			if (!url) return [];
			// Normalizar: remover barra final si existe y agregar ambas versiones
			const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
			return [baseUrl, `${baseUrl}/`];
		}),
	],
	user: {
		modelName: "user",
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
				returned: true,
				input: false,
			},
		},
	},
});
