import { toNodeHandler } from "better-auth/node";
import { adminAuth } from "./src/auth";

export const authHandler = toNodeHandler(adminAuth);