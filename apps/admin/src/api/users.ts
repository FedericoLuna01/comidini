import { authClient } from "@repo/auth/client";
import { queryOptions } from "@tanstack/react-query";
import { createUserSchema } from "../routes/_dashboard-layout/dashboard/usuarios/-components/new-user-form";
import { z } from "zod";

const getAllUsers = async () => {
  const dataUsers = await authClient.admin.listUsers({
    query: {
      limit: 10,
    },
  });

  return dataUsers
}

export const allUsersQueryOptions = queryOptions({
  queryKey: ['get-all-users'],
  queryFn: getAllUsers,
})

export const createUser = async (user: z.infer<typeof createUserSchema>) => {
  return await authClient.admin.createUser({
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  });
}
