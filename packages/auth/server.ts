import { toNodeHandler } from "better-auth/node";
import { adminAuth, webAuth } from "./src/auth";

export const authHandler = toNodeHandler(adminAuth);
export const webAuthHandler = toNodeHandler(webAuth);