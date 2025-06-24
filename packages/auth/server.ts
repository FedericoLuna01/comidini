import { toNodeHandler } from "better-auth/node";
import { auth } from "./src/auth";

export const authHandler = toNodeHandler(auth);