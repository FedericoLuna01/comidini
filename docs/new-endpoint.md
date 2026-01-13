# Crear nuevo endpoint

1. Chequear que el esquema exista en `../packages/db/src/schema`, si no existe crearlo
2. Crear sus tipados en zod
  ``` ts
    export type InsertShop = z.infer<typeof insertShopSchema>;
    export type CreateShop = z.infer<typeof createShopSchema>;
    export type UpdateShop = z.infer<typeof updateShopSchema>;
  ```
3. crear el service en `../packages/db/src/services` 
4. Usarlo en la nueva ruta en el proyecto de `../apps/api`
  1. Si necesitas crear un nuevo archivo para una ruta usa `<schema>.routes.ts` 
  2. En caso de que sea de PUT o POST, validar los datos de esta forma:
  ```ts
    const body = req.body;

    const validatedFields = createProductSchema.safeParse(body);

    if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error);
    res
      .status(400)
      .json({ error: "Invalid product data", details: validatedFields.error });
    return;
    }
  ```
