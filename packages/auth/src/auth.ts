import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db/src"
import { schema } from "@repo/db/src/schema"
import dotenv from "dotenv";
import { admin } from "better-auth/plugins";

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: "../../.env" });

// Validar que las variables de entorno requeridas estén definidas
if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is required");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    admin()
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});