import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
export { type UserWithRole } from "better-auth/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3001",
  plugins: [
    adminClient()
  ]
})