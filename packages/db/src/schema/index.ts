import { user, session, account, verification } from "./auth-schema";

export const schema = {
  user,
  session,
  account,
  verification
} as const;

export * from "./auth-schema";