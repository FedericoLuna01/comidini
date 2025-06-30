import dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import type { MiddlewareInputContext } from "better-auth";
import { db } from "@repo/db/src"
import { schema } from "@repo/db/src/schema"

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

const baseConfig = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true
  },
  secret: process.env.BETTER_AUTH_SECRET,
}

export const adminAuth = betterAuth({
  ...baseConfig,
  baseURL: process.env.ADMIN_BETTER_AUTH_URL,
  user: {
    modelName: "user",
    additionalFields: {
      allowedApps: {
        type: "string[]"
      },
    }
  },
  plugins: [
    admin()
  ]
});