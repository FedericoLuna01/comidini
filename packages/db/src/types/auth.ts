import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { user, session, account, verification, userRoleEnum, userAppEnum } from "../schema/auth-schema";

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

export type UserRole = (typeof userRoleEnum)[keyof typeof userRoleEnum];
export type UserApp = (typeof userAppEnum)[keyof typeof userAppEnum];