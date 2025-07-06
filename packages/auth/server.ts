import { toNodeHandler } from "better-auth/node";
import { auth } from "./src/auth";
export { fromNodeHeaders } from "better-auth/node";

export const authHandler = toNodeHandler(auth);
