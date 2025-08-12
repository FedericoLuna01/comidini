export async function getProductCategoriesByShopId(shopId: number | undefined) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/shops/${shopId}/category`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch categories');

  return response.json();
}
