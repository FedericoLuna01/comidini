import dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { db } from "@repo/db/src"
import { schema } from "@repo/db/src/schema"
import { ac, admin, shop, user } from "./permissions";

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: "../../../.env" });

// Validar que las variables de entorno requeridas estén definidas
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.ADMIN_BETTER_AUTH_URL) {
  throw new Error("ADMIN_BETTER_AUTH_URL environment variable is required");
}

if (!process.env.WEB_BETTER_AUTH_URL) {
  throw new Error("WEB_BETTER_AUTH_URL environment variable is required");
}

if (!process.env.SHOP_BETTER_AUTH_URL) {
  throw new Error("SHOP_BETTER_AUTH_URL environment variable is required");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        shop
      }
    })
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.ADMIN_BETTER_AUTH_URL,
    process.env.WEB_BETTER_AUTH_URL,
    process.env.SHOP_BETTER_AUTH_URL,
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
      allowedApps: {
        type: "string[]"
      },
    },
  },
});
