# Usar un endpoint (fetch)

- SIEMPRE USAR TANSTACK QUERY
- Usar en las tres aplicaciones: `../apps/admin`, `../apps/shop`, `../apps/web`

## General
1. En el archivo de `./apps/<APP>/src/api/<ESQUEMA>.ts`, si no existe crearlo
2. Siempre importar `const API_URL = import.meta.env.VITE_API_URL;`

## Queries
1. Crear la función, ejemplo:
  ``` ts
    export async function getProductById(productId: number) {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error fetching product");
    }

    return response.json();
    }
  ```
2. Crear la queryOption, ejemplo: 
  ``` ts
    export const productByIdQueryOptions = (productId: number) =>
    queryOptions<SelectProductWithCategory>({
      queryKey: ["get-product", productId],
      queryFn: () => getProductById(productId),
      enabled: !!productId,
    });
  ```
3. Usarlo en el componente:
  ``` ts
    const {
        data: productData,
        isLoading,
        error,
    } = useQuery(productByIdQueryOptions(Number(productId)));
  ```

## Mutations
1. Crear la función: 
  ``` ts
    const deleteProductById = async (productId: number) => {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error deleting product");
    }
    };
  ```
2. Crear la mutation: 
  ``` ts
    import { type UseMutationOptions } from "@tanstack/react-query";

    export const deleteProductMutationOptions = (
    productId: number,
    ): UseMutationOptions<void, Error, void> => ({
      mutationKey: ["delete-product", productId],
      mutationFn: () => deleteProductById(productId),
    });
  ```
3. Usarlo en el componente que corresponda:
  ``` ts
    const deleteMutation = useMutation({
      ...deleteProductMutationOptions(product.product.id),
      onSuccess: () => {
        toast.success("Producto eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
        setShowDeleteConfirm(false);
      },
      onError: () => {
        toast.error("Error al eliminar el producto");
      },
    });
  ```
