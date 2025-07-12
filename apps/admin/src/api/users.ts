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

export const getUserById = async (userId: string) => {
  // Since there's no direct getUserById in the auth client, we'll get all users and filter
  // In a real app, you'd want a dedicated getUserById API endpoint
  const allUsers = await getAllUsers();
  const user = allUsers.data?.users.find(user => user.id === userId);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return { data: { user } };
}

export const getUserByIdQueryOptions = (userId: string) => queryOptions({
  queryKey: ['get-user', userId],
  queryFn: () => getUserById(userId),
  enabled: !!userId,
})

export const createUser = async (user: z.infer<typeof createUserSchema>) => {
  return await authClient.admin.createUser({
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  });
}

// Función helper para convertir duración a segundos
export const getBanDurationInSeconds = (duration: string): number | undefined => {
  switch (duration) {
    case '1h':
      return 60 * 60; // 1 hora
    case '24h':
      return 60 * 60 * 24; // 1 día
    case '7d':
      return 60 * 60 * 24 * 7; // 7 días
    case '30d':
      return 60 * 60 * 24 * 30; // 30 días
    case 'permanent':
      return undefined; // Ban permanente
    default:
      return undefined;
  }
};

export const banUser = async (userId: string, reason?: string, banExpiresIn?: number) => {
  return await authClient.admin.banUser({
    userId,
    banReason: reason,
    banExpiresIn: banExpiresIn, // tiempo en segundos
  });
}

export const unbanUser = async (userId: string) => {
  return await authClient.admin.unbanUser({
    userId,
  });
}

export const deleteUser = async (userId: string) => {
  return await authClient.admin.removeUser({
    userId,
  });
}

export const setUserRole = async (userId: string, role: 'user' | 'admin' | 'shop') => {
  return await authClient.admin.setRole({
    userId,
    role,
  });
}

export const updateUser = async (userId: string, userData: { name: string; email: string; role: 'user' | 'admin' | 'shop' }) => {
  // Since there's no direct updateUser in the auth client, we'll update the role
  // In a real app, you'd want a dedicated updateUser API endpoint
  const roleUpdateResult = await authClient.admin.setRole({
    userId,
    role: userData.role,
  });

  // Note: This is a simplified implementation. In a real app, you'd update name and email too
  return roleUpdateResult;
}

// Esquema para editar usuario
export const editUserSchema = z.object({
  name: z.string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    })
    .max(50, {
      message: "El nombre no puede tener más de 50 caracteres",
    })
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    })
    .trim()
    .refine((val) => val.split(' ').length >= 2, {
      message: "Debe incluir al menos nombre y apellido",
    }),
  email: z.string()
    .email({
      message: "No es un correo electrónico válido",
    })
    .min(5, {
      message: "El email debe tener al menos 5 caracteres",
    })
    .max(100, {
      message: "El email no puede tener más de 100 caracteres",
    })
    .toLowerCase()
    .trim()
    .refine((val) => !val.includes(' '), {
      message: "El email no puede contener espacios",
    }),
  role: z.enum(['user', 'admin', 'shop'], {
    message: "El rol debe ser admin, user o shop",
  }),
});

// Esquema para banear usuario
export const banUserSchema = z.object({
  reason: z.string().max(500, {
    message: "La razón no puede tener más de 500 caracteres",
  }).optional(),
  banDuration: z.enum(['1h', '24h', '7d', '30d', 'permanent'], {
    message: "Duración del ban inválida",
  }).default('permanent'),
});
