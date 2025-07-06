import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  // Cambiar dependiendo los permisos que quieras
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})

export const shop = ac.newRole({
  project: ["create", "update", "delete"],
}); 
